"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string; success?: boolean } | undefined;

type Role = Database["public"]["Enums"]["user_role"];

/** Every team-management action must pass this — a hidden tab isn't a real guard. */
async function requireAdmin() {
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

const inviteSchema = z.object({
  email: z.string().trim().email("Email invalide."),
  full_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  role: z.enum(["admin", "employee"]),
});

export async function inviteTeamMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
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

  const admin = createAdminClient();
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { full_name: parsed.data.full_name },
  });

  if (error || !invited.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return { error: "Cet email a déjà un compte." };
    }
    return { error: "Impossible d'envoyer l'invitation." };
  }

  // The trigger that creates the profile row defaults role to 'client' —
  // promote it to what was actually selected in the invite form.
  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: parsed.data.role, full_name: parsed.data.full_name })
    .eq("id", invited.user.id);

  if (roleError) return { error: "Invitation envoyée, mais le rôle n'a pas pu être appliqué." };

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
