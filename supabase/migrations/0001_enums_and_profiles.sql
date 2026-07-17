-- Enums, profiles table, and shared trigger helpers

create type user_role as enum ('admin', 'employee', 'client');
create type lead_status as enum ('new', 'qualification', 'meeting', 'quote_sent', 'signed', 'lost');
create type project_status as enum ('onboarding', 'design', 'development', 'client_validation', 'live', 'maintenance');
create type quote_status as enum ('draft', 'sent', 'viewed', 'accepted', 'refused', 'converted');
create type invoice_status as enum ('created', 'sent', 'paid', 'overdue', 'cancelled');
create type document_category as enum ('image', 'pdf', 'contract', 'other');

-- Generic updated_at trigger, reused by every table below.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'client',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a Supabase Auth user signs up.
-- Role defaults to 'client'; promote to admin/employee manually via SQL or an admin UI.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
