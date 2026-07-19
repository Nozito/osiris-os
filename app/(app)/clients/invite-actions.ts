"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/require-staff";
import { createInvitation, resendInvitation, revokeInvitation } from "@/lib/invitations";

export type ActionState = { error?: string; success?: boolean } | undefined;

const inviteSchema = z.object({
  clientId: z.string().uuid(),
  email: z.string().trim().email("Email invalide."),
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
});

export async function inviteClientAccess(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let staffUser: { id: string };
  try {
    staffUser = await requireStaff();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Action non autorisée." };
  }

  const parsed = inviteSchema.safeParse({
    clientId: formData.get("clientId"),
    email: formData.get("email"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const result = await createInvitation({
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    role: "client",
    clientId: parsed.data.clientId,
    invitedBy: staffUser.id,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath(`/clients/${parsed.data.clientId}`);
  return { success: true };
}

export async function resendClientInvite(invitationId: string, clientId: string): Promise<ActionState> {
  try {
    await requireStaff();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Action non autorisée." };
  }

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .single();
  if (!invitation) return { error: "Invitation introuvable." };

  const result = await resendInvitation(invitation);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function revokeClientInvite(invitationId: string, clientId: string): Promise<ActionState> {
  try {
    await requireStaff();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Action non autorisée." };
  }

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .single();
  if (!invitation) return { error: "Invitation introuvable." };

  const result = await revokeInvitation(invitation);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

/** Read-side helper for the staff "Résumé" tab — current invite state for a client dossier. */
export async function getClientInvitation(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("client_id", clientId)
    .eq("role", "client")
    .neq("status", "revoked")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
