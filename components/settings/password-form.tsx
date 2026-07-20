"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/(app)/settings/actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Mot de passe mis à jour.");
      formRef.current?.reset();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-sm space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="current_password">Mot de passe actuel</Label>
        <PasswordInput id="current_password" name="current_password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new_password">Nouveau mot de passe</Label>
        <PasswordInput id="new_password" name="new_password" minLength={8} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
        <PasswordInput id="confirm_password" name="confirm_password" minLength={8} required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Mise à jour..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
