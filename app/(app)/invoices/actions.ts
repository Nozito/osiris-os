"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/require-admin";
import { invoiceSchema } from "@/lib/validations/invoice";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string } | undefined;

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

function parseInvoiceForm(formData: FormData) {
  const rawItems = formData.get("items");
  let items: unknown[] = [];
  try {
    items = rawItems ? JSON.parse(rawItems as string) : [];
  } catch {
    items = [];
  }

  return invoiceSchema.safeParse({
    client_id: formData.get("client_id"),
    quote_id: formData.get("quote_id") || undefined,
    vat_rate: formData.get("vat_rate"),
    due_at: formData.get("due_at"),
    items,
  });
}

export async function createInvoice(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseInvoiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { items, quote_id, due_at, ...rest } = parsed.data;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      ...rest,
      quote_id: quote_id || null,
      due_at: due_at || null,
      issued_at: new Date().toISOString(),
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    return { error: "Impossible de créer la facture." };
  }

  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(items.map((item, position) => ({ ...item, invoice_id: invoice.id, position })));

  if (itemsError) {
    return { error: "Facture créée mais les lignes n'ont pas pu être enregistrées." };
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const supabase = await createClient();
  const patch: Database["public"]["Tables"]["invoices"]["Update"] = { status };
  if (status === "paid") patch.paid_at = new Date().toISOString();
  const { error } = await supabase.from("invoices").update(patch).eq("id", invoiceId);
  if (error) throw new Error("Impossible de changer le statut.");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function deleteInvoice(invoiceId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("invoices").delete().eq("id", invoiceId);
  revalidatePath("/invoices");
}
