"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, requestEmailChange } from "@/app/(app)/settings/actions";

export function ProfileForm({
  fullName,
  email,
  pendingEmail,
}: {
  fullName: string;
  email: string;
  pendingEmail?: string | null;
}) {
  const [nameState, nameAction, namePending] = useActionState(updateProfile, undefined);
  const [emailState, emailAction, emailPending] = useActionState(requestEmailChange, undefined);

  useEffect(() => {
    if (nameState?.success) toast.success("Profil mis à jour.");
    if (nameState?.error) toast.error(nameState.error);
  }, [nameState]);

  useEffect(() => {
    if (emailState?.success) toast.success("Email de confirmation envoyé à la nouvelle adresse.");
    if (emailState?.error) toast.error(emailState.error);
  }, [emailState]);

  return (
    <div className="space-y-6">
      <form action={nameAction} className="max-w-sm space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input id="full_name" name="full_name" defaultValue={fullName} required />
        </div>
        <Button type="submit" size="sm" disabled={namePending}>
          {namePending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>

      <div className="max-w-sm space-y-3 border-t border-border pt-6">
        <form action={emailAction} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={email} required />
            {pendingEmail && (
              <p className="text-xs text-warning">
                Confirmation en attente pour {pendingEmail} — vérifiez cette boîte mail.
              </p>
            )}
          </div>
          <Button type="submit" size="sm" variant="secondary" disabled={emailPending}>
            {emailPending ? "Envoi..." : "Changer l'email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
