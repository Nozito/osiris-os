"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoreQuickPick } from "@/components/ui/score-quick-pick";
import { cn } from "@/lib/utils";
import { DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createLead } from "@/app/(app)/crm/actions";
import { leadSchema } from "@/lib/validations/lead";

type FieldName = keyof typeof leadSchema.shape;

const STEPS = ["Contact", "Opportunité", "Priorité"];

const SCORE_CRITERIA = [
  { name: "budget_score", label: "Budget" },
  { name: "urgency_score", label: "Urgence" },
  { name: "sector_score", label: "Secteur" },
  { name: "company_size_score", label: "Taille entreprise" },
  { name: "need_clarity_score", label: "Besoin identifié" },
];

export function NewLeadDialogContent({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
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

  function goNext() {
    if (step === 0) {
      if (!name.trim()) {
        setFieldErrors((prev) => ({ ...prev, name: "Le nom est requis" }));
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nouveau lead</DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
          </span>
        </div>
        <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-muted">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-full flex-1 rounded-full transition-colors duration-(--duration-base)",
                i <= step ? "bg-primary" : "bg-transparent"
              )}
            />
          ))}
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Every step stays mounted (just hidden) so field values survive
         * back/forward navigation — this is one form submitted once, not a
         * per-step persistence flow. */}
        <div
          className={cn(
            "space-y-4 rounded-xl border border-border bg-white/[0.015] p-4",
            step !== 0 && "hidden"
          )}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                name="name"
                required
                autoFocus
                value={name}
                className={errorClass("name")}
                onChange={(e) => setName(e.target.value)}
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
        </div>

        <div
          className={cn(
            "space-y-4 rounded-xl border border-border bg-white/[0.015] p-4",
            step !== 1 && "hidden"
          )}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">Source</Label>
              <Input id="source" name="source" placeholder="Site, bouche à oreille..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (€)</Label>
              <Input id="budget" name="budget" type="number" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="urgency">Urgence</Label>
            <Input id="urgency" name="urgency" placeholder="Immédiate, 3 mois..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="need">Besoin</Label>
            <Textarea id="need" name="need" rows={3} />
          </div>
        </div>

        <div
          className={cn(
            "space-y-4 rounded-xl border border-border bg-white/[0.015] p-4",
            step !== 2 && "hidden"
          )}
        >
          <p className="text-xs text-muted-foreground">
            Une estimation rapide suffit — vous pourrez l&apos;affiner plus tard.
          </p>
          {SCORE_CRITERIA.map((criterion) => (
            <div key={criterion.name} className="space-y-1.5">
              <Label>{criterion.label}</Label>
              <ScoreQuickPick
                name={criterion.name}
                value={scores[criterion.name]}
                onChange={(value) =>
                  setScores((s) => ({ ...s, [criterion.name]: value }))
                }
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="flex gap-2">
          {step === 0 ? (
            <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
              Annuler
            </DialogClose>
          ) : (
            <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
              Retour
            </Button>
          )}
          {isLastStep ? (
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Création..." : "Créer le lead"}
            </Button>
          ) : (
            <Button type="button" className="flex-1" onClick={goNext}>
              Continuer
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  );
}
