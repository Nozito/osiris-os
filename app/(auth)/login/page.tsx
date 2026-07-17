"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a75ff] to-[#0052d4] text-primary-foreground font-bold glow-primary">
          O
        </span>
        <h1 className="mt-4 page-title">
          Osiris <span className="text-primary">OS</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous à votre espace
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="vous@osiris-agency.fr" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
