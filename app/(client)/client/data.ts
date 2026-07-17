import { createClient } from "@/lib/supabase/server";

export async function getClientForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("*, client_business_profiles(*), client_branding(*)")
    .eq("owner_profile_id", user.id)
    .maybeSingle();

  return client;
}
