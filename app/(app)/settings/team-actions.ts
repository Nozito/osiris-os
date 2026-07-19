"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/require-admin";
import { createInvitation, resendInvitation, revokeInvitation } from "@/lib/invitations";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string; success?: boolean } | undefined;

type Role = Database["public"]["Enums"]["user_role"];

const inviteSchema = z.object({
  email: z.string().trim().email("Email invalide."),
  full_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  role: z.enum(["admin", "employee"]),
});

export async function inviteTeamMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let adminUser: { id: string };
  try {
    adminUser = await requireAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Action non autorisée." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const result = await createInvitation({
    email: parsed.data.email,
    fullName: parsed.data.full_name,
    role: parsed.data.role,
    invitedBy: adminUser.id,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/settings");
  return { success: true };
}

export async function resendTeamInvite(invitationId: string): Promise<ActionState> {
  try {
    await requireAdmin();
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

  revalidatePath("/settings");
  return { success: true };
}

export async function revokeTeamInvite(invitationId: string): Promise<ActionState> {
  try {
    await requireAdmin();
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

  revalidatePath("/settings");
  return { success: true };
}

const roleSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(["admin", "employee"]),
});

export async function updateMemberRole(profileId: string, role: Role): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Action non autorisée." };
  }

  const parsed = roleSchema.safeParse({ profileId, role });
  if (!parsed.success) return { error: "Requête invalide." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.profileId);

  if (error) return { error: "Impossible de changer le rôle." };

  revalidatePath("/settings");
  return { success: true };
}

export async function removeTeamMember(profileId: string): Promise<ActionState> {
  let currentUserId: string;
  try {
    currentUserId = (await requireAdmin()).id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Action non autorisée." };
  }

  if (profileId === currentUserId) {
    return { error: "Vous ne pouvez pas retirer votre propre accès." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) return { error: "Impossible de retirer l'accès." };

  revalidatePath("/settings");
  return { success: true };
}
