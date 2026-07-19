"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoreSlider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createLead } from "@/app/(app)/crm/actions";
import { leadSchema } from "@/lib/validations/lead";

type FieldName = keyof typeof leadSchema.shape;

const SCORE_CRITERIA = [
  { name: "budget_score", label: "Budget" },
  { name: "urgency_score", label: "Urgence" },
  { name: "sector_score", label: "Secteur" },
  { name: "company_size_score", label: "Taille entreprise" },
  { name: "need_clarity_score", label: "Besoin identifié" },
];

export function NewLeadDialogContent({ onClose }: { onClose: () => void }) {
  const [scores, setScores] = useState<Record<string, number>>({
    budget_score: 50,
    urgency_score: 50,
    sector_score: 50,
    company_size_score: 50,
    need_clarity_score: 50,
  });
  const [state, formAction, pending] = useActionState(createLead, undefined);
  const wasPending = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});

  function validate(name: FieldName, value: string) {
    const result = leadSchema.shape[name].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  function errorClass(name: FieldName) {
    return cn(fieldErrors[name] && "border-destructive focus-visible:ring-destructive/40");
  }

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) toast.error(state.error);
      else {
        toast.success("Lead créé");
        onClose();
      }
    }
    wasPending.current = pending;
  }, [pending, state, onClose]);

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nouveau lead</DialogTitle>
      </DialogHeader>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              name="name"
              required
              className={errorClass("name")}
              onBlur={(e) => validate("name", e.target.value)}
            />
            {fieldErrors.name && (
              <p className="animate-in fade-in-0 slide-in-from-top-1 text-xs text-destructive duration-150">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Entreprise</Label>
            <Input id="company" name="company" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              className={errorClass("email")}
              onBlur={(e) => e.target.value && validate("email", e.target.value)}
            />
            {fieldErrors.email && (
              <p className="animate-in fade-in-0 slide-in-from-top-1 text-xs text-destructive duration-150">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" placeholder="Site, bouche à oreille..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget (€)</Label>
            <Input id="budget" name="budget" type="number" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="urgency">Urgence</Label>
            <Input id="urgency" name="urgency" placeholder="Immédiate, 3 mois..." />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="need">Besoin</Label>
          <Textarea id="need" name="need" rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={2} />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-3">
          <p className="section-title text-xs text-muted-foreground uppercase tracking-wide">
            Scoring (0-100 par critère)
          </p>
          {SCORE_CRITERIA.map((criterion) => (
            <div key={criterion.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor={criterion.name}>{criterion.label}</Label>
                <span className="tabular-nums text-muted-foreground">
                  {scores[criterion.name]}
                </span>
              </div>
              <ScoreSlider
                id={criterion.name}
                name={criterion.name}
                value={scores[criterion.name]}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [criterion.name]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div className="flex gap-2">
          <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
            Annuler
          </DialogClose>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? "Création..." : "Créer le lead"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
