"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/require-admin";
import { leadSchema, leadScoreSchema } from "@/lib/validations/lead";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string } | undefined;

type LeadStatus = Database["public"]["Enums"]["lead_status"];

export async function createLead(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsedLead = leadSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    source: formData.get("source"),
    need: formData.get("need"),
    budget: formData.get("budget"),
    urgency: formData.get("urgency"),
    notes: formData.get("notes"),
  });

  if (!parsedLead.success) {
    return { error: parsedLead.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const parsedScore = leadScoreSchema.safeParse({
    budget_score: formData.get("budget_score"),
    urgency_score: formData.get("urgency_score"),
    sector_score: formData.get("sector_score"),
    company_size_score: formData.get("company_size_score"),
    need_clarity_score: formData.get("need_clarity_score"),
  });

  if (!parsedScore.success) {
    return { error: "Scores invalides." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({ ...parsedLead.data, assigned_to: user?.id })
    .select("id")
    .single();

  if (error || !lead) {
    return { error: "Impossible de créer le lead." };
  }

  const { error: scoreError } = await supabase
    .from("lead_scores")
    .insert({ lead_id: lead.id, ...parsedScore.data });

  if (scoreError) {
    return { error: "Lead créé mais le score n'a pas pu être calculé." };
  }

  revalidatePath("/crm");
  return undefined;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw new Error("Impossible de déplacer le lead.");
  revalidatePath("/crm");
}

export async function updateLead(
  leadId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsedLead = leadSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    source: formData.get("source"),
    need: formData.get("need"),
    budget: formData.get("budget"),
    urgency: formData.get("urgency"),
    notes: formData.get("notes"),
  });

  if (!parsedLead.success) {
    return { error: parsedLead.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const parsedScore = leadScoreSchema.safeParse({
    budget_score: formData.get("budget_score"),
    urgency_score: formData.get("urgency_score"),
    sector_score: formData.get("sector_score"),
    company_size_score: formData.get("company_size_score"),
    need_clarity_score: formData.get("need_clarity_score"),
  });

  const supabase = await createClient();

  const { error } = await supabase.from("leads").update(parsedLead.data).eq("id", leadId);
  if (error) return { error: "Impossible d'enregistrer le lead." };

  if (parsedScore.success) {
    await supabase
      .from("lead_scores")
      .upsert({ lead_id: leadId, ...parsedScore.data }, { onConflict: "lead_id" });
  }

  revalidatePath("/crm");
  return undefined;
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lead } = await supabase
    .from("leads")
    .select("name, company, email, phone")
    .eq("id", leadId)
    .single();

  if (!lead) throw new Error("Lead introuvable.");

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      company_name: lead.company || lead.name,
      contact_name: lead.name,
      email: lead.email,
      phone: lead.phone,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !client) throw new Error("Impossible de créer le client.");

  await supabase
    .from("leads")
    .update({ status: "signed", converted_client_id: client.id })
    .eq("id", leadId);

  revalidatePath("/crm");
  revalidatePath("/clients");
  return client.id;
}

export async function deleteLead(leadId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", leadId);
  revalidatePath("/crm");
}
