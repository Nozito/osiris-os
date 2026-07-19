"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string | null };
type ViewState =
  | { step: "loading" }
  | { step: "unavailable" }
  | { step: "idle"; factors: Factor[] }
  | { step: "enrolling"; factorId: string; qrCode: string; secret: string }
  | { step: "verifying"; factorId: string; qrCode: string; secret: string };

export function MfaSection() {
  const [state, setState] = useState<ViewState>({ step: "loading" });
  const supabase = createClient();

  async function loadFactors() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setState({ step: "unavailable" });
      return;
    }
    setState({ step: "idle", factors: data.totp });
  }

  useEffect(() => {
    loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) {
      toast.error("Impossible de démarrer l'activation. Réessayez.");
      return;
    }
    setState({
      step: "enrolling",
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function confirmEnroll(formData: FormData) {
    if (state.step !== "enrolling" && state.step !== "verifying") return;
    const code = String(formData.get("code") ?? "").trim();
    if (!code) return;

    setState({ ...state, step: "verifying" });
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: state.factorId,
      code,
    });

    if (error) {
      toast.error("Code invalide. Vérifiez votre application d'authentification et réessayez.");
      setState({ ...state, step: "enrolling" });
      return;
    }

    toast.success("Vérification en deux étapes activée.");
    await loadFactors();
  }

  async function removeFactor(factorId: string) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast.error("Impossible de désactiver la vérification en deux étapes.");
      return;
    }
    toast.success("Vérification en deux étapes désactivée.");
    await loadFactors();
  }

  if (state.step === "loading") {
    return <Skeleton className="h-24 w-full max-w-sm" />;
  }

  if (state.step === "unavailable") {
    return (
      <p className="text-sm text-muted-foreground">
        La vérification en deux étapes est temporairement indisponible. Réessayez plus tard.
      </p>
    );
  }

  if (state.step === "enrolling" || state.step === "verifying") {
    return (
      <div className="max-w-sm space-y-4">
        <p className="text-sm text-muted-foreground">
          Scannez ce QR code avec votre application d&apos;authentification (Google
          Authenticator, 1Password...), puis entrez le code à 6 chiffres généré.
        </p>
        <div className="w-fit rounded-lg border border-border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.qrCode} alt="QR code d'activation MFA" width={160} height={160} />
        </div>
        <p className="text-xs text-muted-foreground">
          Ou entrez cette clé manuellement :{" "}
          <span className="font-mono text-foreground">{state.secret}</span>
        </p>
        <form
          action={(formData) => confirmEnroll(formData)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="code">Code de vérification</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              required
            />
          </div>
          <Button type="submit" disabled={state.step === "verifying"}>
            {state.step === "verifying" ? "Vérification..." : "Confirmer"}
          </Button>
        </form>
      </div>
    );
  }

  if (state.factors.length === 0) {
    return (
      <div className="max-w-sm space-y-3">
        <p className="text-sm text-muted-foreground">
          Ajoutez une couche de sécurité supplémentaire à votre compte avec une application
          d&apos;authentification.
        </p>
        <Button type="button" size="sm" onClick={startEnroll}>
          <ShieldCheck className="mr-1.5 h-4 w-4" />
          Activer la vérification en deux étapes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-2">
      {state.factors.map((factor) => (
        <div
          key={factor.id}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>{factor.friendly_name || "Application d'authentification"}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeFactor(factor.id)}
          >
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
            Désactiver
          </Button>
        </div>
      ))}
    </div>
  );
}
