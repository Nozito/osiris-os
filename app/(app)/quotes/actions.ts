"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/require-admin";
import { quoteSchema } from "@/lib/validations/quote";
import { notifyStaffQuoteSigned } from "@/lib/notify";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string } | undefined;

type QuoteStatus = Database["public"]["Enums"]["quote_status"];

function parseQuoteForm(formData: FormData) {
  const rawItems = formData.get("items");
  let items: unknown[] = [];
  try {
    items = rawItems ? JSON.parse(rawItems as string) : [];
  } catch {
    items = [];
  }

  return quoteSchema.safeParse({
    client_id: formData.get("client_id"),
    project_id: formData.get("project_id") || undefined,
    vat_rate: formData.get("vat_rate"),
    terms: formData.get("terms"),
    valid_until: formData.get("valid_until"),
    items,
  });
}

export async function createQuote(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseQuoteForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { items, project_id, valid_until, ...rest } = parsed.data;

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      ...rest,
      project_id: project_id || null,
      valid_until: valid_until || null,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !quote) {
    return { error: "Impossible de créer le devis." };
  }

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(items.map((item, position) => ({ ...item, quote_id: quote.id, position })));

  if (itemsError) {
    return { error: "Devis créé mais les lignes n'ont pas pu être enregistrées." };
  }

  revalidatePath("/quotes");
  redirect(`/quotes/${quote.id}`);
}

export async function updateQuote(
  quoteId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseQuoteForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { items, project_id, valid_until, ...rest } = parsed.data;

  const { error } = await supabase
    .from("quotes")
    .update({ ...rest, project_id: project_id || null, valid_until: valid_until || null })
    .eq("id", quoteId);

  if (error) return { error: "Impossible d'enregistrer le devis." };

  await supabase.from("quote_items").delete().eq("quote_id", quoteId);
  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(items.map((item, position) => ({ ...item, quote_id: quoteId, position })));

  if (itemsError) return { error: "Impossible d'enregistrer les lignes." };

  revalidatePath(`/quotes/${quoteId}`);
  return undefined;
}

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const supabase = await createClient();
  const patch: Database["public"]["Tables"]["quotes"]["Update"] = { status };
  if (status === "sent") patch.issued_at = new Date().toISOString();
  const { error } = await supabase.from("quotes").update(patch).eq("id", quoteId);
  if (error) throw new Error("Impossible de changer le statut.");
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/quotes");
}

export async function signQuote(quoteId: string, signedByName: string) {
  const supabase = await createClient();
  const { data: quote, error } = await supabase
    .from("quotes")
    .update({
      status: "accepted",
      signed_by_name: signedByName,
      signed_at: new Date().toISOString(),
    })
    .eq("id", quoteId)
    .select("id, number")
    .single();
  if (error || !quote) throw new Error("Impossible de signer le devis.");
  revalidatePath(`/client/quotes/${quoteId}`);

  await notifyStaffQuoteSigned({
    id: quote.id,
    number: quote.number ?? quote.id,
    signedByName,
  }).catch(
    () => {
      // Best-effort: signing already succeeded, a failed notification shouldn't fail the flow.
    }
  );
}

export async function duplicateQuote(quoteId: string) {
  const supabase = await createClient();
  const { data: original } = await supabase
    .from("quotes")
    .select("client_id, project_id, vat_rate, terms, quote_items(label, description, quantity, unit_price, position)")
    .eq("id", quoteId)
    .single();

  if (!original) throw new Error("Devis introuvable.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      client_id: original.client_id,
      project_id: original.project_id,
      vat_rate: original.vat_rate,
      terms: original.terms,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !quote) throw new Error("Impossible de dupliquer le devis.");

  await supabase.from("quote_items").insert(
    (original.quote_items ?? []).map((item) => ({ ...item, quote_id: quote.id }))
  );

  revalidatePath("/quotes");
  return quote.id;
}

export async function deleteQuote(quoteId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("quotes").delete().eq("id", quoteId);
  revalidatePath("/quotes");
}

export async function convertQuoteToInvoice(quoteId: string) {
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("client_id, vat_rate, quote_items(label, description, quantity, unit_price, position)")
    .eq("id", quoteId)
    .single();

  if (!quote) throw new Error("Devis introuvable.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      client_id: quote.client_id,
      quote_id: quoteId,
      vat_rate: quote.vat_rate,
      issued_at: new Date().toISOString(),
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !invoice) throw new Error("Impossible de créer la facture.");

  await supabase.from("invoice_items").insert(
    (quote.quote_items ?? []).map((item) => ({ ...item, invoice_id: invoice.id }))
  );

  await supabase.from("quotes").update({ status: "converted" }).eq("id", quoteId);

  revalidatePath("/quotes");
  revalidatePath("/invoices");
  return invoice.id;
}
