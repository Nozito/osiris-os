"use server";

import { getAIProvider, aiActionError, type AIActionResult, type ProspectAnalysisResult } from "@/services/ai";
import { createClient } from "@/lib/supabase/server";

export async function analyzeProspectAction(
  leadId: string
): Promise<AIActionResult<ProspectAnalysisResult>> {
  try {
    const supabase = await createClient();
    const { data: lead } = await supabase
      .from("leads")
      .select("name, company, need, notes")
      .eq("id", leadId)
      .single();

    if (!lead) {
      return { ok: false, code: "unknown", message: "Lead introuvable.", retryable: false };
    }

    const provider = getAIProvider();
    const data = await provider.analyzeProspect({
      name: lead.name,
      company: lead.company,
      need: lead.need,
      currentWebsite: null,
      notes: lead.notes,
    });
    return { ok: true, data };
  } catch (error) {
    return aiActionError(error);
  }
}
