"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Called once the invited user has just set their password (see
 * SetPasswordForm's onSuccess). Marks the invitation accepted and, for a
 * client invite, links the new account to its dossier — the one write that
 * makes the client portal actually work end to end instead of requiring
 * manual SQL (see supabase/migrations/0013_invitations_and_documents.sql).
 *
 * Runs with the service-role client: at this exact moment `owner_profile_id`
 * is not yet `auth.uid()`, so RLS on `clients` would reject the update.
 */
export async function completeInvite(): Promise<{ warning?: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { warning: "Mot de passe mis à jour, mais votre session n'a pas pu être vérifiée." };
  }

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("invitations")
    .select("*")
    .eq("email", user.email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pending) {
    const { data: alreadyAccepted } = await admin
      .from("invitations")
      .select("id")
      .eq("email", user.email)
      .eq("status", "accepted")
      .limit(1)
      .maybeSingle();

    if (alreadyAccepted) {
      return { warning: "Cette invitation a déjà été utilisée — votre mot de passe a bien été mis à jour." };
    }
    return {
      warning:
        "Mot de passe mis à jour, mais aucune invitation associée n'a été trouvée. Contactez un administrateur si votre accès ne fonctionne pas.",
    };
  }

  if (new Date(pending.expires_at) < new Date()) {
    return {
      warning:
        "Mot de passe mis à jour, mais cette invitation avait expiré. Contactez un administrateur pour en recevoir une nouvelle.",
    };
  }

  await admin
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString(), profile_id: user.id })
    .eq("id", pending.id);

  if (pending.role === "client" && pending.client_id) {
    await admin
      .from("clients")
      .update({ owner_profile_id: user.id })
      .eq("id", pending.client_id);
  }
}
