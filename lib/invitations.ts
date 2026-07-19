import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteOrigin } from "@/lib/get-site-origin";
import type { Database } from "@/types/database.types";

type Role = Database["public"]["Enums"]["user_role"];
type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

export type InvitationResult = { ok: true } | { ok: false; error: string };

/**
 * Creates the `invitations` row and sends the actual Supabase Auth invite
 * email in one step. Shared by staff invites (team-actions.ts) and client
 * portal invites (clients/invite-actions.ts) — same underlying mechanism,
 * only `role`/`client_id` differ.
 */
export async function createInvitation(params: {
  email: string;
  fullName: string;
  role: Role;
  clientId?: string;
  invitedBy: string;
}): Promise<InvitationResult> {
  const admin = createAdminClient();
  const origin = await getSiteOrigin();

  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(params.email, {
    data: { full_name: params.fullName },
    redirectTo: `${origin}/accept-invite`,
  });

  if (error || !invited.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return { ok: false, error: "Cet email a déjà un compte." };
    }
    return { ok: false, error: "Impossible d'envoyer l'invitation." };
  }

  // The trigger that creates the profile row defaults role to 'client' —
  // promote it for staff invites (client invites keep the default).
  if (params.role !== "client") {
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: params.role, full_name: params.fullName })
      .eq("id", invited.user.id);
    if (roleError) {
      return { ok: false, error: "Invitation envoyée, mais le rôle n'a pas pu être appliqué." };
    }
  }

  // The trigger already created the profiles row synchronously (same id as
  // invited.user.id) — store it now rather than only at acceptance, so
  // listing/joining pending invitations doesn't need a second lookup.
  const { error: inviteRowError } = await admin.from("invitations").insert({
    email: params.email,
    role: params.role,
    client_id: params.clientId ?? null,
    invited_by: params.invitedBy,
    profile_id: invited.user.id,
  });

  if (inviteRowError) {
    return { ok: false, error: "Invitation envoyée, mais son suivi n'a pas pu être enregistré." };
  }

  return { ok: true };
}

export async function resendInvitation(invitation: Invitation): Promise<InvitationResult> {
  if (invitation.status !== "pending") {
    return { ok: false, error: "Cette invitation n'est plus en attente." };
  }

  const admin = createAdminClient();
  const origin = await getSiteOrigin();

  // The auth user already exists (created at first invite) — `inviteUserByEmail`
  // would reject it as "already registered". `resetPasswordForEmail` works for
  // any existing user regardless of confirmation status and lands them on the
  // same accept-invite link/state machine (exchangeCodeForSession + set password).
  const { error } = await admin.auth.resetPasswordForEmail(invitation.email, {
    redirectTo: `${origin}/accept-invite`,
  });

  if (error) {
    return { ok: false, error: "Impossible de renvoyer l'invitation." };
  }

  const { error: updateError } = await admin
    .from("invitations")
    .update({ invited_at: new Date().toISOString(), expires_at: expiryFromNow() })
    .eq("id", invitation.id);

  if (updateError) return { ok: false, error: "Invitation renvoyée, mais le suivi n'a pas pu être mis à jour." };

  return { ok: true };
}

export async function revokeInvitation(invitation: Invitation): Promise<InvitationResult> {
  if (invitation.status !== "pending") {
    return { ok: false, error: "Cette invitation n'est plus en attente." };
  }

  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitation.id);
  if (updateError) return { ok: false, error: "Impossible d'annuler l'invitation." };

  // The auth user + profile were already created at invite time (Supabase's
  // trigger fires on insert into auth.users, before the link is ever
  // clicked) — since it was never accepted, remove it so the email becomes
  // invitable again.
  if (invitation.profile_id) {
    await admin.auth.admin.deleteUser(invitation.profile_id);
  }

  return { ok: true };
}

function expiryFromNow() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}
