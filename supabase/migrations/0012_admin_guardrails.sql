-- Real admin/employee distinction: block self role-escalation, restrict
-- destructive deletes (quotes/invoices/leads) to admins only.

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: only an admin (or the service-role client used by team-actions.ts
-- for invites/removals) may change a role. RLS alone can't express this
-- (it's row-owned either way), so a trigger enforces the column-level rule.
create or replace function prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role then
    if auth.role() = 'service_role' then
      return new;
    end if;
    if not is_admin() then
      raise exception 'Seuls les administrateurs peuvent modifier les rôles.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on profiles
  for each row execute function prevent_unauthorized_role_change();

-- leads: delete restricted to admins, everything else stays staff-wide.
drop policy "leads_all_staff" on leads;
create policy "leads_select_staff" on leads for select using (is_staff());
create policy "leads_insert_staff" on leads for insert with check (is_staff());
create policy "leads_update_staff" on leads for update using (is_staff()) with check (is_staff());
create policy "leads_delete_admin" on leads for delete using (is_admin());

-- quotes: same split.
drop policy "quotes_all_staff" on quotes;
create policy "quotes_select_staff" on quotes for select using (is_staff());
create policy "quotes_insert_staff" on quotes for insert with check (is_staff());
create policy "quotes_update_staff" on quotes for update using (is_staff()) with check (is_staff());
create policy "quotes_delete_admin" on quotes for delete using (is_admin());

-- invoices: same split.
drop policy "invoices_all_staff" on invoices;
create policy "invoices_select_staff" on invoices for select using (is_staff());
create policy "invoices_insert_staff" on invoices for insert with check (is_staff());
create policy "invoices_update_staff" on invoices for update using (is_staff()) with check (is_staff());
create policy "invoices_delete_admin" on invoices for delete using (is_admin());
