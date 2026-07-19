import { createClient } from "@/lib/supabase/server";
import { NewLeadDialog } from "@/components/crm/new-lead-dialog";
import { KanbanBoard } from "@/components/crm/kanban-board";
import type { LeadDetail } from "@/components/crm/lead-detail-sheet";
import { PageHeader } from "@/components/layout/page-header";

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, name, company, email, phone, source, need, budget, urgency, notes, status, lead_scores(budget_score, urgency_score, sector_score, company_size_score, need_clarity_score, total_score)"
    )
    .order("created_at", { ascending: false });

  const items: LeadDetail[] = (leads ?? []).map((lead) => ({
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    need: lead.need,
    budget: lead.budget,
    urgency: lead.urgency,
    notes: lead.notes,
    status: lead.status,
    scores: lead.lead_scores,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description={`${items.length} lead${items.length > 1 ? "s" : ""} dans le pipeline commercial.`}
        actions={<NewLeadDialog />}
      />

      <KanbanBoard leads={items} />
    </div>
  );
}
