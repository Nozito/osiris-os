"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateOfferAction } from "@/app/(app)/clients/ai-actions";
import type { CommercialOfferResult } from "@/services/ai";

export function AiOfferPanel({ clientId }: { clientId: string }) {
  const [result, setResult] = useState<CommercialOfferResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      try {
        const data = await generateOfferAction(clientId);
        setResult(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Génération IA indisponible.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Proposition commerciale générée par IA
        </p>
        <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={handleGenerate}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Génération..." : "Générer une offre"}
        </Button>
      </div>

      {result && (
        <div className="space-y-2 text-sm">
          <p>{result.proposal}</p>
          <div>
            <p className="text-xs font-medium">Arguments</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.arguments.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium">Structure du devis suggérée</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.structure.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
