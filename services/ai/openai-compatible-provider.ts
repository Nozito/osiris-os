import OpenAI from "openai";
import type {
  AIProvider,
  CommercialOfferInput,
  CommercialOfferResult,
  ProspectAnalysisInput,
  ProspectAnalysisResult,
  WebStrategyInput,
  WebStrategyResult,
} from "./provider";

// Works with any OpenAI-compatible chat completions endpoint (OpenAI, Groq, OpenRouter, ...).
export class OpenAICompatibleProvider implements AIProvider {
  constructor(
    private client: OpenAI,
    private model: string
  ) {}

  private async completeJSON<T>(system: string, user: string): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse IA vide.");
    return JSON.parse(content) as T;
  }

  async generateCommercialOffer(
    input: CommercialOfferInput
  ): Promise<CommercialOfferResult> {
    return this.completeJSON<CommercialOfferResult>(
      "Tu es un consultant commercial senior pour une agence web premium (Osiris Agency). " +
        "Génère une proposition commerciale percutante en français. " +
        'Réponds strictement en JSON avec les clés : "proposal" (string, 2-3 phrases), ' +
        '"arguments" (array de strings, 3-5 arguments de vente), ' +
        '"structure" (array de strings, sections recommandées pour le devis).',
      JSON.stringify(input)
    );
  }

  async analyzeProspect(input: ProspectAnalysisInput): Promise<ProspectAnalysisResult> {
    return this.completeJSON<ProspectAnalysisResult>(
      "Tu es un analyste commercial pour une agence web premium (Osiris Agency). " +
        "Analyse ce prospect à partir des informations fournies. " +
        'Réponds strictement en JSON avec les clés : "summary" (string, 1-2 phrases), ' +
        '"opportunities" (array de strings, opportunités commerciales identifiées), ' +
        '"recommendations" (array de strings, actions recommandées pour qualifier/convertir ce lead).',
      JSON.stringify(input)
    );
  }

  async generateWebStrategy(input: WebStrategyInput): Promise<WebStrategyResult> {
    return this.completeJSON<WebStrategyResult>(
      "Tu es un architecte web senior pour une agence web premium (Osiris Agency). " +
        "Propose une stratégie de site web adaptée à ce client. " +
        'Réponds strictement en JSON avec les clés : "architecture" (array de strings, structure du site), ' +
        '"recommendedPages" (array de strings, pages recommandées), ' +
        '"uxRecommendations" (array de strings, recommandations UX/conversion).',
      JSON.stringify(input)
    );
  }
}
