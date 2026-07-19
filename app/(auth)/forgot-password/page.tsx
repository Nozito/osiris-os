"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OsirisMark } from "@/components/layout/osiris-mark";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <MailCheck className="h-5 w-5" />
        </span>
        <div className="space-y-1.5">
          <h1 className="font-heading text-xl font-bold tracking-tight">Vérifiez votre boîte mail</h1>
          <p className="text-sm text-muted-foreground">
            Si un compte existe pour cette adresse, un lien de réinitialisation vient d&apos;être
            envoyé. Il expire après un court délai.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <OsirisMark size={32} className="mb-5 lg:hidden" />
        <h1 className="font-heading text-xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-muted-foreground">
          Entrez votre email, nous vous envoyons un lien pour le réinitialiser.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="vous@osiris-agency.fr" required />
        </div>
        {state?.error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Envoi..." : "Envoyer le lien"}
        </Button>
        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground"
        >
          Retour à la connexion
        </Link>
      </form>
    </div>
  );
}
