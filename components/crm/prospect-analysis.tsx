"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyzeProspectAction } from "@/app/(app)/crm/ai-actions";
import type { ProspectAnalysisResult } from "@/services/ai";

export function ProspectAnalysis({ leadId }: { leadId: string }) {
  const [result, setResult] = useState<ProspectAnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAnalyze() {
    startTransition(async () => {
      try {
        const data = await analyzeProspectAction(leadId);
        setResult(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Analyse IA indisponible.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Analyse IA</p>
        <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={handleAnalyze}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Analyse..." : "Analyser ce prospect"}
        </Button>
      </div>

      {result && (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">{result.summary}</p>
          <div>
            <p className="text-xs font-medium">Opportunités</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.opportunities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium">Recommandations</p>
            <ul className="ml-4 list-disc text-muted-foreground">
              {result.recommendations.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
