import "server-only";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user's role, for conditional UI (e.g. admin-only delete buttons). */
export async function getCurrentRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role ?? null;
}
