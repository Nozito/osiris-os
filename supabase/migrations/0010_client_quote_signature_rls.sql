-- Allow a client-portal user to sign (accept/refuse) their own quotes.

create policy "quotes_update_own" on quotes
  for update
  using (owns_client(client_id))
  with check (owns_client(client_id));
