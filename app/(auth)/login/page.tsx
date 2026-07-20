"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { OsirisMark } from "@/components/layout/osiris-mark";
import { playAuthTransition, endAuthTransition } from "@/lib/auth-transition";
import { createClient } from "@/lib/supabase/client";
import { signIn } from "./actions";

function goToDashboard(router: ReturnType<typeof useRouter>) {
  playAuthTransition("in").then(() => {
    router.push("/dashboard");
    router.refresh();
    setTimeout(endAuthTransition, 400);
  });
}

function MfaChallenge({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const factor = data?.totp?.[0];
      if (factor) setFactorId(factor.id);
      else setError("Aucun moyen de vérification configuré. Contactez un administrateur.");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (verifyError) {
      setError("Code invalide. Vérifiez votre application d'authentification.");
      setPending(false);
      setCode("");
      return;
    }

    onSuccess();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <OsirisMark size={32} className="mb-5 lg:hidden" />
        <h1 className="font-heading text-xl font-bold tracking-tight">Vérification</h1>
        <p className="text-sm text-muted-foreground">
          Entrez le code généré par votre application d&apos;authentification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="mfa_code">Code à 6 chiffres</Label>
          <Input
            id="mfa_code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
            required
          />
        </div>
        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending || code.length !== 6}>
          {pending ? "Vérification..." : "Valider"}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);
  const [mfaRequired, setMfaRequired] = useState(false);
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!state?.success || hasChecked.current) return;
    hasChecked.current = true;

    const supabase = createClient();
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      if (data && data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
        setMfaRequired(true);
      } else {
        goToDashboard(router);
      }
    });
  }, [state, router]);

  if (mfaRequired) {
    return <MfaChallenge onSuccess={() => goToDashboard(router)} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <OsirisMark size={32} className="mb-5 lg:hidden" />
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Accédez à votre espace Osiris OS.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="vous@osiris-agency.fr" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <PasswordInput id="password" name="password" placeholder="••••••••" required />
        </div>
        {state?.error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending || state?.success}>
          {pending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
