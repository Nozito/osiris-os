create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_idx on notifications (profile_id);
create index notifications_unread_idx on notifications (profile_id) where read_at is null;
