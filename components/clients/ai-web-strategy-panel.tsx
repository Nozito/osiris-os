"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateWebStrategyAction } from "@/app/(app)/clients/ai-actions";
import type { WebStrategyResult } from "@/services/ai";

export function AiWebStrategyPanel({ clientId }: { clientId: string }) {
  const [result, setResult] = useState<WebStrategyResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      try {
        const data = await generateWebStrategyAction(clientId);
        setResult(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Génération IA indisponible.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Stratégie web générée par IA
        </p>
        <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={handleGenerate}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Génération..." : "Générer une stratégie"}
        </Button>
      </div>

      {result && (
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs font-medium">Architecture du site</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.architecture.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium">Pages recommandées</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.recommendedPages.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium">Recommandations UX</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.uxRecommendations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
