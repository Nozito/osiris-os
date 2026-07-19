"use client";

import { Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateOfferAction } from "@/app/(app)/clients/ai-actions";
import { useAIAction } from "@/lib/use-ai-action";

export function AiOfferPanel({ clientId }: { clientId: string }) {
  const { state, run, isPending } = useAIAction(() => generateOfferAction(clientId));

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Proposition commerciale générée par IA
        </p>
        {state.status !== "ready" && (
          <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={run}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {isPending ? "Génération..." : "Générer une offre"}
          </Button>
        )}
      </div>

      {state.status === "idle" && (
        <p className="text-xs text-muted-foreground">Aucune offre générée pour l&apos;instant.</p>
      )}

      {state.status === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <p>{state.message}</p>
            {state.retryable && (
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-destructive" onClick={run}>
                <RotateCcw className="mr-1 h-3 w-3" />
                Réessayer
              </Button>
            )}
          </div>
        </div>
      )}

      {state.status === "ready" && (
        <div className="space-y-2 text-sm">
          <p>{state.data.proposal}</p>
          <div>
            <p className="text-xs font-medium">Arguments</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {state.data.arguments.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium">Structure du devis suggérée</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {state.data.structure.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground" onClick={run}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Régénérer
          </Button>
        </div>
      )}
    </div>
  );
}
