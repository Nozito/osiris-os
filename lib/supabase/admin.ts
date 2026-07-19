import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role client — bypasses RLS entirely via `auth.admin.*`. Never import
 * this from a client component. Every caller must gate access itself (see
 * `requireAdmin` in app/(app)/settings/team-actions.ts) since this client has
 * no notion of "who is calling".
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
