"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getAIProvider,
  aiActionError,
  type AIActionResult,
  type CommercialOfferResult,
  type WebStrategyResult,
} from "@/services/ai";

async function loadClientContext(clientId: string) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("company_name, sector, client_business_profiles(ideal_client, goals, services, advantages)")
    .eq("id", clientId)
    .single();

  return client;
}

export async function generateOfferAction(
  clientId: string
): Promise<AIActionResult<CommercialOfferResult>> {
  try {
    const client = await loadClientContext(clientId);
    if (!client) {
      return { ok: false, code: "unknown", message: "Client introuvable.", retryable: false };
    }
    const profile = client.client_business_profiles;

    const provider = getAIProvider();
    const data = await provider.generateCommercialOffer({
      companyName: client.company_name,
      sector: client.sector,
      idealClient: profile?.ideal_client,
      goals: profile?.goals,
      services: profile?.services as string[] | null,
      advantages: profile?.advantages,
    });
    return { ok: true, data };
  } catch (error) {
    return aiActionError(error);
  }
}

export async function generateWebStrategyAction(
  clientId: string
): Promise<AIActionResult<WebStrategyResult>> {
  try {
    const client = await loadClientContext(clientId);
    if (!client) {
      return { ok: false, code: "unknown", message: "Client introuvable.", retryable: false };
    }
    const profile = client.client_business_profiles;

    const provider = getAIProvider();
    const data = await provider.generateWebStrategy({
      companyName: client.company_name,
      sector: client.sector,
      goals: profile?.goals,
      services: profile?.services as string[] | null,
    });
    return { ok: true, data };
  } catch (error) {
    return aiActionError(error);
  }
}
