"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoreSlider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  updateLead,
  updateLeadStatus,
  deleteLead,
  convertLeadToClient,
} from "@/app/(app)/crm/actions";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import type { Database } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

const ProspectAnalysis = dynamic(
  () => import("@/components/crm/prospect-analysis").then((mod) => mod.ProspectAnalysis),
  { ssr: false, loading: () => <Skeleton className="h-16 w-full rounded-lg" /> }
);

type LeadStatus = Database["public"]["Enums"]["lead_status"];

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
  canDelete,
}: {
  lead: LeadDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canDelete: boolean;
}) {
  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <LeadDetailForm lead={lead} onClose={() => onOpenChange(false)} canDelete={canDelete} />
      </SheetContent>
    </Sheet>
  );
}

function LeadDetailForm({
  lead,
  onClose,
  canDelete,
}: {
  lead: LeadDetail;
  onClose: () => void;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const deleteConfirm = useConfirmDialog();
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

  function handleStatusChange(status: string | null) {
    if (!status || status === lead.status) return;
    startTransition(async () => {
      try {
        await updateLeadStatus(lead.id, status as LeadStatus);
        toast.success("Statut mis à jour");
        router.refresh();
      } catch {
        toast.error("Impossible de changer le statut.");
      }
    });
  }

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
    deleteConfirm.setOpen(false);
    startTransition(async () => {
      try {
        await deleteLead(lead.id);
        toast.success("Lead supprimé");
        onClose();
        router.refresh();
      } catch {
        toast.error("Échec de la suppression.");
      }
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{lead.name}</SheetTitle>
      </SheetHeader>
      <div className="px-4">
        <Select
          value={lead.status}
          onValueChange={handleStatusChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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

        <div className="space-y-4 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="section-title text-xs text-muted-foreground uppercase tracking-wide">
              Scoring
            </p>
            <span className="stat-value text-sm">
              {lead.scores?.total_score ?? "—"}
              <span className="text-xs font-normal text-muted-foreground"> / 100</span>
            </span>
          </div>
          {SCORE_CRITERIA.map((criterion) => (
            <div key={criterion.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor={criterion.name}>{criterion.label}</Label>
                <span className="tabular-nums text-muted-foreground">
                  {scores[criterion.name as keyof typeof scores]}
                </span>
              </div>
              <ScoreSlider
                id={criterion.name}
                name={criterion.name}
                value={scores[criterion.name as keyof typeof scores]}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [criterion.name]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <SheetFooter className="flex-row justify-between gap-2 px-0">
          <div>
            {canDelete && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  disabled={isPending}
                  onClick={deleteConfirm.requestConfirm}
                >
                  Supprimer
                </Button>
                <ConfirmDialog
                  open={deleteConfirm.open}
                  onOpenChange={deleteConfirm.setOpen}
                  title="Supprimer ce lead ?"
                  description="Cette action est définitive et ne peut pas être annulée."
                  confirmLabel="Supprimer"
                  pending={isPending}
                  onConfirm={handleDelete}
                />
              </>
            )}
          </div>
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
