import { createClient } from "@/lib/supabase/server";
import { computeTotals } from "@/lib/validations/quote";
import { LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";

export async function getDashboardKpis() {
  const supabase = await createClient();

  const [
    { count: leadsActifs },
    { count: devisEnvoyes },
    { count: projetsActifs },
    { count: facturesEnRetard },
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
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "overdue"),
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
    facturesEnRetard: facturesEnRetard ?? 0,
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

/** Active-pipeline leads grouped by stage — the "second level of reading" next to revenue. */
export async function getPipelineBreakdown() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("status")
    .not("status", "in", "(signed,lost)");

  const stages = ["new", "qualification", "meeting", "quote_sent"] as const;
  const counts = Object.fromEntries(stages.map((s) => [s, 0])) as Record<
    (typeof stages)[number],
    number
  >;
  for (const lead of data ?? []) {
    if (lead.status in counts) counts[lead.status as (typeof stages)[number]]++;
  }

  const total = stages.reduce((sum, s) => sum + counts[s], 0);
  return stages.map((status) => ({
    status,
    label: LEAD_STATUS_LABELS[status],
    count: counts[status],
    ratio: total > 0 ? counts[status] / total : 0,
  }));
}

/** Active leads sorted by qualification score — what to work on first. */
export async function getLeadsToFollowUp(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, name, company, status, lead_scores(total_score)")
    .not("status", "in", "(signed,lost)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? [])
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      status: lead.status,
      score: lead.lead_scores?.total_score ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Quotes sent/viewed but not yet answered — oldest first (most overdue to follow up). */
export async function getQuotesPending(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("id, number, status, vat_rate, issued_at, clients(company_name), quote_items(quantity, unit_price)")
    .in("status", ["sent", "viewed"])
    .order("issued_at", { ascending: true })
    .limit(limit);

  return (data ?? []).map((quote) => ({
    id: quote.id,
    number: quote.number,
    status: quote.status,
    clientName: quote.clients?.company_name ?? "—",
    ttc: computeTotals(quote.quote_items ?? [], quote.vat_rate).ttc,
  }));
}

/** Invoices needing attention: overdue first, then due within 7 days. */
export async function getInvoicesToWatch(limit = 5) {
  const supabase = await createClient();
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);

  const { data } = await supabase
    .from("invoices")
    .select(
      "id, number, status, vat_rate, due_at, clients(company_name), invoice_items(quantity, unit_price)"
    )
    .or(`status.eq.overdue,and(status.eq.sent,due_at.lte.${soon.toISOString().slice(0, 10)})`)
    .limit(limit * 2);

  return (data ?? [])
    .map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      dueAt: invoice.due_at,
      clientName: invoice.clients?.company_name ?? "—",
      ttc: computeTotals(invoice.invoice_items ?? [], invoice.vat_rate).ttc,
    }))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "overdue" ? -1 : 1;
      return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
    })
    .slice(0, limit);
}

/** Active projects, delivery date soonest first — flagged at-risk if the date has passed. */
export async function getProjectsInProgress(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, status, delivery_date, clients(company_name)")
    .not("status", "in", "(live,maintenance)")
    .order("delivery_date", { ascending: true, nullsFirst: false })
    .limit(limit);

  const today = new Date().toISOString().slice(0, 10);
  return (data ?? []).map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    deliveryDate: project.delivery_date,
    clientName: project.clients?.company_name ?? "—",
    atRisk: !!project.delivery_date && project.delivery_date < today,
  }));
}

type ActivityEvent = {
  id: string;
  label: string;
  date: string;
  href: string;
  tone: "default" | "success";
};

/** Merged, sorted feed across leads/quotes/invoices/project status changes — no dedicated activity table needed. */
export async function getActivityFeed(limit = 8) {
  const supabase = await createClient();

  const [leads, quotesCreated, quotesSigned, invoicesPaid, statusChanges] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, company, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("quotes")
      .select("id, number, created_at, clients(company_name)")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("quotes")
      .select("id, number, signed_at, clients(company_name)")
      .not("signed_at", "is", null)
      .order("signed_at", { ascending: false })
      .limit(limit),
    supabase
      .from("invoices")
      .select("id, number, paid_at, clients(company_name)")
      .eq("status", "paid")
      .not("paid_at", "is", null)
      .order("paid_at", { ascending: false })
      .limit(limit),
    supabase
      .from("project_status_history")
      .select("id, to_status, created_at, projects(id, name)")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const events: ActivityEvent[] = [];

  for (const lead of leads.data ?? []) {
    events.push({
      id: `lead-${lead.id}`,
      label: `Nouveau lead — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      date: lead.created_at,
      href: "/crm",
      tone: "default",
    });
  }
  for (const quote of quotesCreated.data ?? []) {
    events.push({
      id: `quote-${quote.id}`,
      label: `Devis ${quote.number} créé — ${quote.clients?.company_name ?? "—"}`,
      date: quote.created_at,
      href: `/quotes/${quote.id}`,
      tone: "default",
    });
  }
  for (const quote of quotesSigned.data ?? []) {
    if (!quote.signed_at) continue;
    events.push({
      id: `quote-signed-${quote.id}`,
      label: `Devis ${quote.number} signé — ${quote.clients?.company_name ?? "—"}`,
      date: quote.signed_at,
      href: `/quotes/${quote.id}`,
      tone: "success",
    });
  }
  for (const invoice of invoicesPaid.data ?? []) {
    if (!invoice.paid_at) continue;
    events.push({
      id: `invoice-${invoice.id}`,
      label: `Facture ${invoice.number} payée — ${invoice.clients?.company_name ?? "—"}`,
      date: invoice.paid_at,
      href: `/invoices/${invoice.id}`,
      tone: "success",
    });
  }
  for (const change of statusChanges.data ?? []) {
    const label = PROJECT_STATUS_LABELS[change.to_status as keyof typeof PROJECT_STATUS_LABELS];
    events.push({
      id: `status-${change.id}`,
      label: `${change.projects?.name ?? "Projet"} → ${label ?? change.to_status}`,
      date: change.created_at,
      href: change.projects?.id ? `/projects/${change.projects.id}` : "/projects",
      tone: "default",
    });
  }

  return events.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
