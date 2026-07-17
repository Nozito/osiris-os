-- Projects, one client can have several.

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  name text not null,
  description text,
  budget numeric,
  start_date date,
  delivery_date date,
  status project_status not null default 'onboarding',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_client_id_idx on projects (client_id);
create index projects_status_idx on projects (status);

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

alter table documents
  add constraint documents_project_id_fkey
  foreign key (project_id) references projects (id) on delete set null;

create table project_status_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  from_status project_status,
  to_status project_status not null,
  changed_by uuid references profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index project_status_history_project_id_idx on project_status_history (project_id);

create or replace function log_project_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into project_status_history (project_id, from_status, to_status, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.status else null end,
      new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger projects_log_status_change
  after insert or update of status on projects
  for each row execute function log_project_status_change();
