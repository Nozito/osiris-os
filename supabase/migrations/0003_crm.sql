-- Leads pipeline and scoring.

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text,
  need text,
  budget numeric,
  urgency text,
  notes text,
  status lead_status not null default 'new',
  assigned_to uuid references profiles (id) on delete set null,
  converted_client_id uuid references clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_idx on leads (status);
create index leads_assigned_to_idx on leads (assigned_to);

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

create table lead_scores (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references leads (id) on delete cascade,
  budget_score smallint not null default 0 check (budget_score between 0 and 100),
  urgency_score smallint not null default 0 check (urgency_score between 0 and 100),
  sector_score smallint not null default 0 check (sector_score between 0 and 100),
  company_size_score smallint not null default 0 check (company_size_score between 0 and 100),
  need_clarity_score smallint not null default 0 check (need_clarity_score between 0 and 100),
  total_score smallint not null default 0,
  computed_at timestamptz not null default now()
);

-- Simple weighted average for V1; swap the body for an AI-assisted score later
-- without touching the trigger wiring or the lead_scores schema.
create or replace function calculate_lead_score()
returns trigger
language plpgsql
as $$
begin
  new.total_score = round(
    (new.budget_score * 0.3)
    + (new.urgency_score * 0.25)
    + (new.sector_score * 0.15)
    + (new.company_size_score * 0.15)
    + (new.need_clarity_score * 0.15)
  );
  new.computed_at = now();
  return new;
end;
$$;

create trigger lead_scores_calculate
  before insert or update on lead_scores
  for each row execute function calculate_lead_score();
