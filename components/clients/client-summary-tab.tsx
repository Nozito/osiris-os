"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Circle, FileText, Lock, Mail, RotateCw, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  inviteClientAccess,
  resendClientInvite,
  revokeClientInvite,
} from "@/app/(app)/clients/invite-actions";

type Invitation = {
  id: string;
  email: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
  expires_at: string;
} | null;

type OnboardingStep = { label: string; complete: boolean };

function InviteClientDialog({ clientId, clientEmail }: { clientId: string; clientEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(inviteClientAccess, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success("Invitation envoyée au client.");
      setOpen(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Inviter au portail
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Inviter ce client à son portail</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nom du contact</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={clientEmail ?? ""} required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
              Annuler
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Envoi..." : "Envoyer l'invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccessCard({
  clientId,
  clientEmail,
  invitation,
}: {
  clientId: string;
  clientEmail: string | null;
  invitation: Invitation;
}) {
  const [isPending, startTransition] = useTransition();

  const isExpired =
    invitation?.status === "pending" && new Date(invitation.expires_at) < new Date();

  function handleResend() {
    if (!invitation) return;
    startTransition(async () => {
      const result = await resendClientInvite(invitation.id, clientId);
      if (result?.error) toast.error(result.error);
      else toast.success("Invitation renvoyée.");
    });
  }

  function handleRevoke() {
    if (!invitation) return;
    startTransition(async () => {
      const result = await revokeClientInvite(invitation.id, clientId);
      if (result?.error) toast.error(result.error);
      else toast.success("Invitation annulée.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <p className="section-title">Accès portail</p>
      </CardHeader>
      <CardContent>
        {!invitation ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Ce client n&apos;a pas encore accès à son portail.
            </p>
            <InviteClientDialog clientId={clientId} clientEmail={clientEmail} />
          </div>
        ) : invitation.status === "accepted" ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Actif
            </Badge>
            <p className="text-sm text-muted-foreground">
              {invitation.email} — accès activé le{" "}
              {new Date(invitation.accepted_at!).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                {isExpired ? "Invitation expirée" : "Invitation envoyée"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {invitation.email} — {isExpired ? "expirée" : "expire"} le{" "}
                {new Date(invitation.expires_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={isPending} onClick={handleResend}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                Renvoyer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                disabled={isPending}
                onClick={handleRevoke}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OnboardingCard({ steps }: { steps: OnboardingStep[] }) {
  const doneCount = steps.filter((s) => s.complete).length;
  const allDone = doneCount === steps.length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <p className="section-title">Onboarding</p>
        <Badge variant={allDone ? "secondary" : "outline"}>
          {allDone ? "Terminé" : `${doneCount}/${steps.length}`}
        </Badge>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-2 text-sm">
              {step.complete ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
              <span className={cn(!step.complete && "text-muted-foreground")}>{step.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DocumentsSummaryCard({
  visibleCount,
  internalCount,
  clientProvidedCount,
  pendingRequestsCount,
}: {
  visibleCount: number;
  internalCount: number;
  clientProvidedCount: number;
  pendingRequestsCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <p className="section-title">Documents</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{visibleCount} visible{visibleCount > 1 ? "s" : ""} client</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{internalCount} interne{internalCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{clientProvidedCount} fourni{clientProvidedCount > 1 ? "s" : ""} par le client</span>
          </div>
          {pendingRequestsCount > 0 && (
            <div className="flex items-center gap-2 text-primary">
              <span>{pendingRequestsCount} demande{pendingRequestsCount > 1 ? "s" : ""} en attente</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClientSummaryTab({
  clientId,
  clientEmail,
  invitation,
  onboardingSteps,
  documentStats,
}: {
  clientId: string;
  clientEmail: string | null;
  invitation: Invitation;
  onboardingSteps: OnboardingStep[];
  documentStats: {
    visibleCount: number;
    internalCount: number;
    clientProvidedCount: number;
    pendingRequestsCount: number;
  };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AccessCard clientId={clientId} clientEmail={clientEmail} invitation={invitation} />
      <OnboardingCard steps={onboardingSteps} />
      <div className="md:col-span-2">
        <DocumentsSummaryCard {...documentStats} />
      </div>
    </div>
  );
}
