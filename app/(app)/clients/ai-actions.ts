"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getAIProvider,
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

  if (!client) throw new Error("Client introuvable.");
  return client;
}

export async function generateOfferAction(clientId: string): Promise<CommercialOfferResult> {
  const client = await loadClientContext(clientId);
  const profile = client.client_business_profiles;

  const provider = getAIProvider();
  return provider.generateCommercialOffer({
    companyName: client.company_name,
    sector: client.sector,
    idealClient: profile?.ideal_client,
    goals: profile?.goals,
    services: profile?.services as string[] | null,
    advantages: profile?.advantages,
  });
}

export async function generateWebStrategyAction(clientId: string): Promise<WebStrategyResult> {
  const client = await loadClientContext(clientId);
  const profile = client.client_business_profiles;

  const provider = getAIProvider();
  return provider.generateWebStrategy({
    companyName: client.company_name,
    sector: client.sector,
    goals: profile?.goals,
    services: profile?.services as string[] | null,
  });
}
