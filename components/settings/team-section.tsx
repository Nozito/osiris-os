"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteTeamMember, updateMemberRole, removeTeamMember } from "@/app/(app)/settings/team-actions";

type Role = "admin" | "employee";
type Member = { id: string; full_name: string | null; role: Role; email?: string | null };

const ROLE_LABELS: Record<Role, string> = { admin: "Administrateur", employee: "Collaborateur" };

function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(inviteTeamMember, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success("Invitation envoyée.");
      setOpen(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Inviter
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Rôle</Label>
            <Select name="role" defaultValue="employee">
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Collaborateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
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

function MemberRow({ member, currentUserId }: { member: Member; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isSelf = member.id === currentUserId;
  const initials = (member.full_name || member.email || "?").slice(0, 2).toUpperCase();

  function handleRoleChange(value: string | null) {
    if (!value || value === member.role) return;
    startTransition(async () => {
      const result = await updateMemberRole(member.id, value as Role);
      if (result?.error) toast.error(result.error);
      else toast.success("Rôle mis à jour.");
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeTeamMember(member.id);
      if (result?.error) {
        toast.error(result.error);
        setOpen(false);
        return;
      }
      toast.success("Accès retiré.");
      setOpen(false);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.full_name || "—"} {isSelf && <span className="text-muted-foreground">(vous)</span>}
        </p>
        {member.email && (
          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
        )}
      </div>

      {isSelf ? (
        <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
      ) : (
        <>
          <Select value={member.role} onValueChange={handleRoleChange} disabled={isPending}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Collaborateur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" />
              }
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Retirer l&apos;accès</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Retirer l&apos;accès de {member.full_name || "ce membre"} ?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Cette action supprime définitivement son compte. Il ne pourra plus se connecter.
              </p>
              <div className="flex gap-2">
                <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
                  Annuler
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={isPending}
                  onClick={handleRemove}
                >
                  {isPending ? "Retrait..." : "Retirer l'accès"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export function TeamSection({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {members.length} membre{members.length > 1 ? "s" : ""} de l&apos;équipe.
        </p>
        <InviteDialog />
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Aucun membre pour l'instant"
          description="Invitez vos collaborateurs à rejoindre Osiris OS."
        />
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
