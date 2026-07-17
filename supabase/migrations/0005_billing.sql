-- Quotes and invoices, with server-generated sequential numbers (never client-supplied).

create sequence quote_number_seq;
create sequence invoice_number_seq;

create table quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique, -- set by trigger below, e.g. DEV-2026-0001
  client_id uuid not null references clients (id) on delete restrict,
  project_id uuid references projects (id) on delete set null,
  status quote_status not null default 'draft',
  vat_rate numeric not null default 20,
  terms text,
  issued_at timestamptz,
  valid_until date,
  signed_by_name text,
  signed_at timestamptz,
  signature_ip text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotes_client_id_idx on quotes (client_id);
create index quotes_status_idx on quotes (status);

create trigger quotes_set_updated_at
  before update on quotes
  for each row execute function set_updated_at();

create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  label text not null,
  description text,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  position smallint not null default 0
);

create index quote_items_quote_id_idx on quote_items (quote_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique, -- set by trigger below, e.g. FAC-2026-0001
  client_id uuid not null references clients (id) on delete restrict,
  quote_id uuid references quotes (id) on delete set null,
  status invoice_status not null default 'created',
  vat_rate numeric not null default 20,
  issued_at timestamptz,
  due_at date,
  paid_at timestamptz,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_client_id_idx on invoices (client_id);
create index invoices_status_idx on invoices (status);

create trigger invoices_set_updated_at
  before update on invoices
  for each row execute function set_updated_at();

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  label text not null,
  description text,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  position smallint not null default 0
);

create index invoice_items_invoice_id_idx on invoice_items (invoice_id);

create or replace function set_quote_number()
returns trigger
language plpgsql
as $$
begin
  if new.number is null then
    new.number := 'DEV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('quote_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger quotes_set_number
  before insert on quotes
  for each row execute function set_quote_number();

create or replace function set_invoice_number()
returns trigger
language plpgsql
as $$
begin
  if new.number is null then
    new.number := 'FAC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger invoices_set_number
  before insert on invoices
  for each row execute function set_invoice_number();
