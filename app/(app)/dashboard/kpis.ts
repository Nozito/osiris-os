import { createClient } from "@/lib/supabase/server";

export async function getDashboardKpis() {
  const supabase = await createClient();

  const [
    { count: leadsActifs },
    { count: devisEnvoyes },
    { count: projetsActifs },
    { data: quotesSignes },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(signed,lost)"),
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .in("status", ["sent", "viewed"]),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(live,maintenance)"),
    supabase
      .from("quotes")
      .select("id, vat_rate, quote_items(quantity, unit_price)")
      .eq("status", "accepted"),
  ]);

  const caSigne = (quotesSignes ?? []).reduce((total, quote) => {
    const items = quote.quote_items ?? [];
    const ht = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    return total + ht * (1 + quote.vat_rate / 100);
  }, 0);

  return {
    leadsActifs: leadsActifs ?? 0,
    devisEnvoyes: devisEnvoyes ?? 0,
    projetsActifs: projetsActifs ?? 0,
    caSigne,
  };
}

export async function getRevenueTrend() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select("issued_at, vat_rate, invoice_items(quantity, unit_price)")
    .eq("status", "paid")
    .not("issued_at", "is", null)
    .order("issued_at", { ascending: true });

  const byMonth = new Map<string, number>();
  for (const invoice of data ?? []) {
    const month = new Date(invoice.issued_at!).toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });
    const items = invoice.invoice_items ?? [];
    const ht = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const ttc = ht * (1 + invoice.vat_rate / 100);
    byMonth.set(month, (byMonth.get(month) ?? 0) + ttc);
  }

  return Array.from(byMonth.entries()).map(([month, total]) => ({ month, total }));
}
