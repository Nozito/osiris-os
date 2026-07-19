"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = { error?: string; sent?: boolean } | undefined;

const emailSchema = z.string().trim().email();

async function getSiteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

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
