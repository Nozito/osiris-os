"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { OsirisMark } from "@/components/layout/osiris-mark";
import { createClient } from "@/lib/supabase/client";

type Step = "verifying" | "ready" | "submitting" | "success" | "invalid";

export type SetPasswordCopy = {
  title: string;
  description: string;
  submitLabel: string;
  submitPendingLabel: string;
  successTitle: string;
  successDescription: string;
  invalidTitle: string;
  invalidDescription: string;
  invalidActionHref: string;
  invalidActionLabel: string;
};

/**
 * The verifying/ready/submitting/success/invalid state machine behind both
 * "reset your password" and "accept your invite" — Supabase's recovery and
 * invite links both land the user in an authenticated recovery-type session
 * via the same `code` param, so the flow (exchangeCodeForSession + set a
 * password) is identical; only the copy and the post-success side effect differ.
 */
export function SetPasswordForm({
  copy,
  redirectTo,
  onSuccess,
}: {
  copy: SetPasswordCopy;
  redirectTo: string;
  onSuccess?: () => Promise<{ warning?: string } | void>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 text-center">
          <OsirisMark size={32} className="mx-auto lg:hidden" />
          <p className="text-sm text-muted-foreground">Vérification du lien...</p>
        </div>
      }
    >
      <SetPasswordFormInner copy={copy} redirectTo={redirectTo} onSuccess={onSuccess} />
    </Suspense>
  );
}

function SetPasswordFormInner({
  copy,
  redirectTo,
  onSuccess,
}: {
  copy: SetPasswordCopy;
  redirectTo: string;
  onSuccess?: () => Promise<{ warning?: string } | void>;
}) {
  const [step, setStep] = useState<Step>("verifying");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createClient();

    if (!code) {
      // The SDK may already have exchanged the code (e.g. on a fast refresh);
      // check for a live recovery session before declaring the link invalid.
      supabase.auth.getSession().then(({ data }) => {
        setStep(data.session ? "ready" : "invalid");
      });
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      setStep(exchangeError ? "invalid" : "ready");
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm_password") ?? "");

    if (password.length < 8) {
      setError("8 caractères minimum.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setStep("submitting");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Impossible de mettre à jour le mot de passe. Réessayez.");
      setStep("ready");
      return;
    }

    if (onSuccess) {
      try {
        const result = await onSuccess();
        if (result?.warning) setWarning(result.warning);
      } catch {
        // Password is already set at this point — surface nothing blocking,
        // the linking side effect (if any) can be retried by staff/support.
      }
    }

    setStep("success");
    setTimeout(() => router.push(redirectTo), 2000);
  }

  if (step === "verifying") {
    return (
      <div className="space-y-4 text-center">
        <OsirisMark size={32} className="mx-auto lg:hidden" />
        <p className="text-sm text-muted-foreground">Vérification du lien...</p>
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-1.5">
          <h1 className="font-heading text-xl font-bold tracking-tight">{copy.invalidTitle}</h1>
          <p className="text-sm text-muted-foreground">{copy.invalidDescription}</p>
        </div>
        <Link href={copy.invalidActionHref}>
          <Button className="w-full">{copy.invalidActionLabel}</Button>
        </Link>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="space-y-1.5">
          <h1 className="font-heading text-xl font-bold tracking-tight">{copy.successTitle}</h1>
          <p className="text-sm text-muted-foreground">{copy.successDescription}</p>
        </div>
        {warning && (
          <p className="rounded-md border border-[color-mix(in_oklch,var(--warning),transparent_80%)] bg-[color-mix(in_oklch,var(--warning),transparent_90%)] px-3 py-2 text-sm text-[color-mix(in_oklch,var(--warning),white_25%)]">
            {warning}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <OsirisMark size={32} className="mb-5 lg:hidden" />
        <h1 className="font-heading text-xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <PasswordInput id="password" name="password" minLength={8} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
          <PasswordInput id="confirm_password" name="confirm_password" minLength={8} required />
        </div>
        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={step === "submitting"}>
          {step === "submitting" ? copy.submitPendingLabel : copy.submitLabel}
        </Button>
      </form>
    </div>
  );
}
