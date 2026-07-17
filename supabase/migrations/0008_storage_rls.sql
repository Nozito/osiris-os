-- Storage RLS for the 'documents' bucket. Objects are stored under `${client_id}/filename`,
-- so a client can only read/write inside its own client_id folder.

create policy "documents_storage_all_staff" on storage.objects
  for all
  using (bucket_id = 'documents' and is_staff())
  with check (bucket_id = 'documents' and is_staff());

create policy "documents_storage_select_own" on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and owns_client((storage.foldername(name))[1]::uuid)
  );
