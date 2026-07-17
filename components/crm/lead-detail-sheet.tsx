"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  updateLead,
  deleteLead,
  convertLeadToClient,
} from "@/app/(app)/crm/actions";
import { ProspectAnalysis } from "@/components/crm/prospect-analysis";

const SCORE_CRITERIA = [
  { name: "budget_score", label: "Budget" },
  { name: "urgency_score", label: "Urgence" },
  { name: "sector_score", label: "Secteur" },
  { name: "company_size_score", label: "Taille entreprise" },
  { name: "need_clarity_score", label: "Besoin identifié" },
];

export type LeadDetail = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  need: string | null;
  budget: number | null;
  urgency: string | null;
  notes: string | null;
  status: string;
  scores: {
    budget_score: number;
    urgency_score: number;
    sector_score: number;
    company_size_score: number;
    need_clarity_score: number;
    total_score: number;
  } | null;
};

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
}: {
  lead: LeadDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <LeadDetailForm lead={lead} onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function LeadDetailForm({ lead, onClose }: { lead: LeadDetail; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scores, setScores] = useState({
    budget_score: lead.scores?.budget_score ?? 50,
    urgency_score: lead.scores?.urgency_score ?? 50,
    sector_score: lead.scores?.sector_score ?? 50,
    company_size_score: lead.scores?.company_size_score ?? 50,
    need_clarity_score: lead.scores?.need_clarity_score ?? 50,
  });
  const [state, formAction, pending] = useActionState(
    updateLead.bind(null, lead.id),
    undefined
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) toast.error(state.error);
      else {
        toast.success("Lead mis à jour");
        router.refresh();
      }
    }
    wasPending.current = pending;
  }, [pending, state, router]);

  function handleConvert() {
    startTransition(async () => {
      try {
        const clientId = await convertLeadToClient(lead.id);
        toast.success("Lead converti en client");
        onClose();
        router.push(`/clients/${clientId}`);
      } catch {
        toast.error("Échec de la conversion");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteLead(lead.id);
      toast.success("Lead supprimé");
      onClose();
      router.refresh();
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{lead.name}</SheetTitle>
      </SheetHeader>
      <form action={formAction} className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" defaultValue={lead.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Entreprise</Label>
            <Input id="company" name="company" defaultValue={lead.company ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={lead.email ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" defaultValue={lead.phone ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" defaultValue={lead.source ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget (€)</Label>
            <Input id="budget" name="budget" type="number" defaultValue={lead.budget ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="urgency">Urgence</Label>
            <Input id="urgency" name="urgency" defaultValue={lead.urgency ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="need">Besoin</Label>
          <Textarea id="need" name="need" rows={2} defaultValue={lead.need ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={lead.notes ?? ""} />
        </div>

        <ProspectAnalysis leadId={lead.id} />

        <div className="space-y-3 rounded-lg border border-border/60 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Scoring</p>
            <span className="text-xs font-semibold tabular-nums">
              Total : {lead.scores?.total_score ?? "—"}
            </span>
          </div>
          {SCORE_CRITERIA.map((criterion) => (
            <div key={criterion.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor={criterion.name}>{criterion.label}</Label>
                <span className="tabular-nums text-muted-foreground">
                  {scores[criterion.name as keyof typeof scores]}
                </span>
              </div>
              <input
                id={criterion.name}
                name={criterion.name}
                type="range"
                min={0}
                max={100}
                value={scores[criterion.name as keyof typeof scores]}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [criterion.name]: Number(e.target.value) }))
                }
                className="w-full accent-primary"
              />
            </div>
          ))}
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <SheetFooter className="flex-row justify-between gap-2 px-0">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            Supprimer
          </Button>
          <div className="flex gap-2">
            {lead.status !== "signed" && (
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={handleConvert}
              >
                Convertir en client
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </>
  );
}
