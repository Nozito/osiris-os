-- Row Level Security: admin/employee get full access, clients only see their own data.

-- security definer + owned by the migration role (postgres), which owns every table below,
-- so this bypasses RLS on `profiles` instead of recursing into the policy it's used by.
create or replace function is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'employee')
  );
$$;

create or replace function owns_client(target_client_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from clients
    where id = target_client_id and owner_profile_id = auth.uid()
  );
$$;

alter table profiles enable row level security;
alter table clients enable row level security;
alter table client_business_profiles enable row level security;
alter table client_branding enable row level security;
alter table documents enable row level security;
alter table leads enable row level security;
alter table lead_scores enable row level security;
alter table projects enable row level security;
alter table project_status_history enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table notifications enable row level security;

-- profiles
create policy "profiles_select_own_or_staff" on profiles
  for select using (id = auth.uid() or is_staff());
create policy "profiles_update_own_or_staff" on profiles
  for update using (id = auth.uid() or is_staff());
create policy "profiles_insert_staff" on profiles
  for insert with check (is_staff());

-- clients
create policy "clients_all_staff" on clients
  for all using (is_staff()) with check (is_staff());
create policy "clients_select_own" on clients
  for select using (owner_profile_id = auth.uid());

-- client_business_profiles
create policy "client_business_profiles_all_staff" on client_business_profiles
  for all using (is_staff()) with check (is_staff());
create policy "client_business_profiles_select_own" on client_business_profiles
  for select using (owns_client(client_id));

-- client_branding
create policy "client_branding_all_staff" on client_branding
  for all using (is_staff()) with check (is_staff());
create policy "client_branding_select_own" on client_branding
  for select using (owns_client(client_id));

-- documents
create policy "documents_all_staff" on documents
  for all using (is_staff()) with check (is_staff());
create policy "documents_select_own" on documents
  for select using (owns_client(client_id));

-- leads / lead_scores — staff only, never exposed to clients
create policy "leads_all_staff" on leads
  for all using (is_staff()) with check (is_staff());
create policy "lead_scores_all_staff" on lead_scores
  for all using (is_staff()) with check (is_staff());

-- projects
create policy "projects_all_staff" on projects
  for all using (is_staff()) with check (is_staff());
create policy "projects_select_own" on projects
  for select using (owns_client(client_id));

-- project_status_history
create policy "project_status_history_all_staff" on project_status_history
  for all using (is_staff()) with check (is_staff());
create policy "project_status_history_select_own" on project_status_history
  for select using (
    exists (select 1 from projects where projects.id = project_id and owns_client(projects.client_id))
  );

-- quotes
create policy "quotes_all_staff" on quotes
  for all using (is_staff()) with check (is_staff());
create policy "quotes_select_own" on quotes
  for select using (owns_client(client_id));

-- quote_items
create policy "quote_items_all_staff" on quote_items
  for all using (is_staff()) with check (is_staff());
create policy "quote_items_select_own" on quote_items
  for select using (
    exists (select 1 from quotes where quotes.id = quote_id and owns_client(quotes.client_id))
  );

-- invoices
create policy "invoices_all_staff" on invoices
  for all using (is_staff()) with check (is_staff());
create policy "invoices_select_own" on invoices
  for select using (owns_client(client_id));

-- invoice_items
create policy "invoice_items_all_staff" on invoice_items
  for all using (is_staff()) with check (is_staff());
create policy "invoice_items_select_own" on invoice_items
  for select using (
    exists (select 1 from invoices where invoices.id = invoice_id and owns_client(invoices.client_id))
  );

-- notifications
create policy "notifications_all_staff" on notifications
  for all using (is_staff()) with check (is_staff());
create policy "notifications_select_own" on notifications
  for select using (profile_id = auth.uid());
create policy "notifications_update_own" on notifications
  for update using (profile_id = auth.uid());
