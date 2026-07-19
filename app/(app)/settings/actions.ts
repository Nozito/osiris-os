"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: boolean } | undefined;

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
});

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = profileSchema.safeParse({ full_name: formData.get("full_name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée, reconnectez-vous." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer le profil." };

  revalidatePath("/settings");
  return { success: true };
}

const emailSchema = z.object({ email: z.string().trim().email("Email invalide.") });

export async function requestEmailChange(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Cet email est déjà utilisé par un autre compte." };
    }
    return { error: "Impossible de lancer le changement d'email." };
  }

  revalidatePath("/settings");
  return { success: true };
}

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Mot de passe actuel requis."),
    new_password: z.string().min(8, "8 caractères minimum."),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm_password"],
  });

export async function changePassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = passwordSchema.safeParse({
    current_password: formData.get("current_password"),
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Session expirée, reconnectez-vous." };

  // Re-verify the current password before allowing a change — a hijacked
  // session shouldn't be able to lock the real owner out silently.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (reauthError) return { error: "Mot de passe actuel incorrect." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.new_password });
  if (error) return { error: "Impossible de changer le mot de passe." };

  return { success: true };
}

const notifPrefsSchema = z.object({ notify_on_quote_signed: z.boolean() });

export async function updateNotificationPrefs(prefs: { notify_on_quote_signed: boolean }) {
  const parsed = notifPrefsSchema.safeParse(prefs);
  if (!parsed.success) throw new Error("Préférences invalides.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expirée, reconnectez-vous.");

  const { error } = await supabase
    .from("profiles")
    .update({ notify_on_quote_signed: parsed.data.notify_on_quote_signed })
    .eq("id", user.id);

  if (error) throw new Error("Impossible d'enregistrer la préférence.");
  revalidatePath("/settings");
}
