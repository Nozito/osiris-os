import OpenAI from "openai";
import type { AIProvider } from "./provider";
import { OpenAICompatibleProvider } from "./openai-compatible-provider";
import { AIError } from "./errors";

let cachedProvider: AIProvider | null = null;

function buildProvider(): AIProvider {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return new OpenAICompatibleProvider(
      new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" }),
      process.env.AI_MODEL || "llama-3.3-70b-versatile"
    );
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return new OpenAICompatibleProvider(
      new OpenAI({ apiKey: openaiKey }),
      process.env.AI_MODEL || "gpt-4o-mini"
    );
  }

  console.error(
    "[AI] Aucune clé IA configurée — ajoutez GROQ_API_KEY ou OPENAI_API_KEY dans .env.local."
  );
  throw new AIError("config_missing");
}

export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = buildProvider();
  }
  return cachedProvider;
}

export { AIError, aiActionError } from "./errors";
export type { AIErrorCode, AIActionResult } from "./errors";
export type {
  AIProvider,
  CommercialOfferInput,
  CommercialOfferResult,
  ProspectAnalysisInput,
  ProspectAnalysisResult,
  WebStrategyInput,
  WebStrategyResult,
} from "./provider";
