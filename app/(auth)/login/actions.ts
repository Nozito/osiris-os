"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginState = { error?: string; success?: boolean } | undefined;

export async function signIn(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Identifiants incorrects." };
  }

  return { success: true };
}

/**
 * Does not redirect: callers play the logo draw-out transition first, then
 * navigate client-side once it resolves (see LogoutButton).
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
