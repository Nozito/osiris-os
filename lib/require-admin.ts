import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guard for admin-only actions — a hidden button isn't a real
 * permission check. Throws a clear, user-facing message; the RLS policies
 * (see supabase/migrations/0012_admin_guardrails.sql) enforce the same rule
 * at the database layer as defense in depth.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expirée, reconnectez-vous.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Action réservée aux administrateurs.");
  }
  return user;
}
