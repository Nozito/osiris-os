-- Real, enforceable notification preference (backs the Settings > Notifications tab).
alter table profiles
  add column notify_on_quote_signed boolean not null default true;
