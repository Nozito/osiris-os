"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { clientSchema, businessProfileSchema } from "@/lib/validations/client";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string } | undefined;

export async function createClientRecord(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = clientSchema.safeParse({
    company_name: formData.get("company_name"),
    contact_name: formData.get("contact_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    sector: formData.get("sector"),
    current_website: formData.get("current_website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed.data, created_by: user?.id })
    .select("id")
    .single();

  if (error) {
    return { error: "Impossible de créer le client." };
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

function linesToArray(value?: string) {
  if (!value) return undefined;
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function updateClientInfo(
  clientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = clientSchema.safeParse({
    company_name: formData.get("company_name"),
    contact_name: formData.get("contact_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    sector: formData.get("sector"),
    current_website: formData.get("current_website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", clientId);

  if (error) return { error: "Impossible d'enregistrer." };

  revalidatePath(`/clients/${clientId}`);
  return undefined;
}

export async function updateBusinessProfile(
  clientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = businessProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Formulaire invalide." };

  const { services, products, ...rest } = parsed.data;
  const payload: Database["public"]["Tables"]["client_business_profiles"]["Insert"] = {
    client_id: clientId,
    ...rest,
  };
  if (services !== undefined) payload.services = linesToArray(services) ?? [];
  if (products !== undefined) payload.products = linesToArray(products) ?? [];

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("client_business_profiles")
    .upsert(payload, { onConflict: "client_id" });

  if (error) return { error: "Impossible d'enregistrer." };

  revalidatePath(`/clients/${clientId}`);
  return undefined;
}

export async function updateBranding(
  clientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const logo_url = (formData.get("logo_url") as string) || null;
  const colors = linesToArray(formData.get("colors") as string) ?? [];
  const fonts = linesToArray(formData.get("fonts") as string) ?? [];
  const inspirations = linesToArray(formData.get("inspirations") as string) ?? [];

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("client_branding")
    .upsert(
      { client_id: clientId, logo_url, colors, fonts, inspirations },
      { onConflict: "client_id" }
    );

  if (error) return { error: "Impossible d'enregistrer." };

  revalidatePath(`/clients/${clientId}`);
  return undefined;
}
