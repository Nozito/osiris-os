"use server";

import { getAIProvider, type ProspectAnalysisResult } from "@/services/ai";
import { createClient } from "@/lib/supabase/server";

export async function analyzeProspectAction(leadId: string): Promise<ProspectAnalysisResult> {
  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("name, company, need, notes")
    .eq("id", leadId)
    .single();

  if (!lead) throw new Error("Lead introuvable.");

  const provider = getAIProvider();
  return provider.analyzeProspect({
    name: lead.name,
    company: lead.company,
    need: lead.need,
    currentWebsite: null,
    notes: lead.notes,
  });
}
