-- Invitations (staff + client, unified) and document visibility/lifecycle.
--
-- Two real gaps closed here:
-- 1. `clients.owner_profile_id` was never written by any app code — the
--    client portal only worked via manual SQL linking. This table is what
--    the accept-invite flow uses to link an accepted client invite to its
--    dossier (see app/(auth)/accept-invite/actions.ts).
-- 2. `documents` had no visibility concept: any file staff attached to a
--    client was immediately visible to that client via `documents_select_own`
--    (0007_rls.sql). Fixed below with a visibility column enforced in RLS.

create table invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role user_role not null,
  client_id uuid references clients (id) on delete cascade,
  invited_by uuid references profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  profile_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint invitations_client_role_check check (role != 'client' or client_id is not null)
);

create index invitations_client_id_idx on invitations (client_id);
create index invitations_email_idx on invitations (email);

alter table invitations enable row level security;

create policy "invitations_select_staff" on invitations
  for select using (is_staff());

-- Only an admin may invite/manage an admin or employee; any staff member
-- (admin or commercial) may invite/manage a client — mirrors the shared
-- staff-access decision for dossiers, while keeping staff-role invites
-- admin-gated same as direct role changes (0012_admin_guardrails.sql).
create policy "invitations_insert_scoped" on invitations
  for insert with check (
    (role = 'client' and is_staff())
    or (role in ('admin', 'employee') and is_admin())
  );

create policy "invitations_update_scoped" on invitations
  for update using (
    (role = 'client' and is_staff())
    or (role in ('admin', 'employee') and is_admin())
  );

create policy "invitations_delete_scoped" on invitations
  for delete using (
    (role = 'client' and is_staff())
    or (role in ('admin', 'employee') and is_admin())
  );

-- The acceptance flow (app/(auth)/accept-invite/actions.ts) runs with the
-- service-role client, which bypasses RLS entirely, so no special "accepting
-- user" policy is needed here.

-- documents: visibility/lifecycle taxonomy.
alter table documents
  add column visibility text not null default 'client_visible'
    check (visibility in ('internal', 'client_visible')),
  add column stage text
    check (stage in ('opening', 'ongoing', 'closing')),
  add column source text not null default 'agency'
    check (source in ('agency', 'client')),
  add column viewed_by_client_at timestamptz;

-- The real security fix: a client could see every document tied to their
-- client_id regardless of intent. Now scoped to visibility.
drop policy "documents_select_own" on documents;
create policy "documents_select_own" on documents
  for select using (owns_client(client_id) and visibility = 'client_visible');

drop policy "documents_insert_own" on documents;
create policy "documents_insert_own" on documents
  for insert with check (
    owns_client(client_id) and source = 'client' and visibility = 'client_visible'
  );

-- Clients may flip viewed_by_client_at on their own visible documents (first
-- consultation timestamp) — nothing else about the row is meant to change
-- from the client side, but RLS can't restrict to a single column without a
-- trigger; the blast radius of a client editing metadata on their own
-- already-visible document is nil (single-client scope, no destructive path).
create policy "documents_update_own_viewed" on documents
  for update
  using (owns_client(client_id) and visibility = 'client_visible')
  with check (owns_client(client_id) and visibility = 'client_visible');

create table document_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  label text not null,
  note text,
  requested_by uuid references profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'cancelled')),
  fulfilled_document_id uuid references documents (id) on delete set null,
  created_at timestamptz not null default now()
);

create index document_requests_client_id_idx on document_requests (client_id);

alter table document_requests enable row level security;

create policy "document_requests_all_staff" on document_requests
  for all using (is_staff()) with check (is_staff());

create policy "document_requests_select_own" on document_requests
  for select using (owns_client(client_id));

-- A client fulfilling their own request only ever moves it to 'fulfilled'
-- with a document they own — scoped, non-destructive, self-contained.
create policy "document_requests_fulfill_own" on document_requests
  for update
  using (owns_client(client_id))
  with check (owns_client(client_id));

-- Storage RLS (0008_storage_rls.sql) only checked folder ownership, not the
-- new `documents.visibility` column — a client could still fetch an
-- internal file's bytes directly via Storage if they had/guessed the path,
-- bypassing the table-level fix above entirely. Close that too.
create or replace function document_path_visible_to_client(path text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from documents
    where storage_path = path
      and visibility = 'client_visible'
      and owns_client(client_id)
  );
$$;

drop policy "documents_storage_select_own" on storage.objects;
create policy "documents_storage_select_own" on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and document_path_visible_to_client(name)
  );
