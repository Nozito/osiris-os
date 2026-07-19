import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guard for staff-only actions (admin or employee) — same
 * pattern as requireAdmin.ts, one rung down: client invites/document
 * management are meant to be usable by any commercial, not admin-only.
 */
export async function requireStaff() {
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

  if (profile?.role !== "admin" && profile?.role !== "employee") {
    throw new Error("Action réservée à l'équipe Osiris.");
  }
  return user;
}
