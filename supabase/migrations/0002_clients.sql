-- Clients and everything attached to a client's business/branding profile.

create table clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  sector text,
  current_website text,
  social_links jsonb not null default '{}'::jsonb,
  owner_profile_id uuid references profiles (id) on delete set null, -- the client-portal user for this client
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_owner_profile_id_idx on clients (owner_profile_id);

create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

create table client_business_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients (id) on delete cascade,
  -- avatar client
  ideal_client text,
  age_range text,
  situation text,
  pain_points text,
  goals text,
  objections text,
  avg_budget numeric,
  -- offre
  services jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  advantages text,
  differentiation text,
  -- positionnement
  promise text,
  values text,
  competitors text,
  communication_tone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger client_business_profiles_set_updated_at
  before update on client_business_profiles
  for each row execute function set_updated_at();

create table client_branding (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients (id) on delete cascade,
  logo_url text,
  colors jsonb not null default '[]'::jsonb,
  fonts jsonb not null default '[]'::jsonb,
  inspirations jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger client_branding_set_updated_at
  before update on client_branding
  for each row execute function set_updated_at();

create table documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  project_id uuid, -- fk added in 0004_projects.sql once the table exists
  uploaded_by uuid references profiles (id) on delete set null,
  storage_path text not null,
  file_name text not null,
  file_type text,
  size_bytes bigint,
  category document_category not null default 'other',
  created_at timestamptz not null default now()
);

create index documents_client_id_idx on documents (client_id);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
