-- Allow a client-portal user to fill in their own onboarding data.
-- (Previous policies only let staff write; clients could only read their own rows.)

create policy "clients_update_own" on clients
  for update
  using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());

create policy "client_business_profiles_upsert_own" on client_business_profiles
  for insert
  with check (owns_client(client_id));
create policy "client_business_profiles_update_own" on client_business_profiles
  for update
  using (owns_client(client_id))
  with check (owns_client(client_id));

create policy "client_branding_upsert_own" on client_branding
  for insert
  with check (owns_client(client_id));
create policy "client_branding_update_own" on client_branding
  for update
  using (owns_client(client_id))
  with check (owns_client(client_id));

create policy "documents_insert_own" on documents
  for insert
  with check (owns_client(client_id));

create policy "documents_storage_insert_own" on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and owns_client((storage.foldername(name))[1]::uuid)
  );
