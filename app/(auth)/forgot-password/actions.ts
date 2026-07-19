"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/get-site-origin";

export type ForgotPasswordState = { error?: string; sent?: boolean } | undefined;

const emailSchema = z.string().trim().email();

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Entrez une adresse email valide." };
  }

  const supabase = await createClient();
  const origin = await getSiteOrigin();

  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/reset-password`,
  });

  // Always report success — never reveal whether an account exists for this email.
  return { sent: true };
}
