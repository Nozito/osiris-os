"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SuccessCheck } from "@/components/ui/success-check";
import {
  updateClientInfo,
  updateBusinessProfile,
  updateBranding,
  type ActionState,
} from "@/app/(app)/clients/actions";

const STEPS = ["Entreprise", "Avatar & offre", "Positionnement", "Direction artistique"];

function useAdvanceOnSuccess(
  action: (state: ActionState, formData: FormData) => Promise<ActionState>,
  onSuccess: () => void
) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) toast.error(state.error);
      else onSuccess();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return { state, formAction, pending };
}

export function OnboardingWizard({
  clientId,
  defaults,
}: {
  clientId: string;
  defaults: {
    company_name?: string | null;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    sector?: string | null;
    current_website?: string | null;
    ideal_client?: string | null;
    age_range?: string | null;
    pain_points?: string | null;
    goals?: string | null;
    services?: string[] | null;
    advantages?: string | null;
    promise?: string | null;
    values?: string | null;
    competitors?: string | null;
    logo_url?: string | null;
    colors?: string[] | null;
    fonts?: string[] | null;
    inspirations?: string[] | null;
  };
}) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  const info = useAdvanceOnSuccess(updateClientInfo.bind(null, clientId), next);
  const avatar = useAdvanceOnSuccess(updateBusinessProfile.bind(null, clientId), next);
  const positioning = useAdvanceOnSuccess(updateBusinessProfile.bind(null, clientId), next);
  const branding = useAdvanceOnSuccess(updateBranding.bind(null, clientId), () => setCompleted(true));

  const slideVariants = {
    enter: shouldReduceMotion ? {} : { opacity: 0, x: 16 },
    center: { opacity: 1, x: 0 },
    exit: shouldReduceMotion ? {} : { opacity: 0, x: -16 },
  };
  const slideTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

  if (completed) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border py-16 text-center">
        <SuccessCheck size={48} />
        <div className="space-y-1.5">
          <p className="font-heading text-lg font-bold tracking-tight">
            Onboarding terminé
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Merci ! Ces informations nous permettent de démarrer votre projet dans les
            meilleures conditions. Notre équipe revient vers vous très vite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors duration-(--duration-base)",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "border border-primary text-primary"
                    : "border border-border text-muted-foreground"
              )}
            >
              {i < step ? (
                <motion.span
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={
                    shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 20 }
                  }
                  className="flex items-center justify-center"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.span>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "text-xs transition-colors duration-(--duration-base)",
                i === step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.form
            key="step-0"
            action={info.formAction}
            className="space-y-4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <StepFields
              fields={[
                { name: "company_name", label: "Entreprise", defaultValue: defaults.company_name },
                { name: "contact_name", label: "Contact", defaultValue: defaults.contact_name },
                { name: "email", label: "Email", defaultValue: defaults.email },
                { name: "phone", label: "Téléphone", defaultValue: defaults.phone },
                { name: "address", label: "Adresse", defaultValue: defaults.address },
                { name: "sector", label: "Secteur", defaultValue: defaults.sector },
                {
                  name: "current_website",
                  label: "Site actuel",
                  defaultValue: defaults.current_website,
                },
              ]}
              error={info.state?.error}
              pending={info.pending}
            />
          </motion.form>
        )}

        {step === 1 && (
          <motion.form
            key="step-1"
            action={avatar.formAction}
            className="space-y-4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <StepFields
              fields={[
                { name: "ideal_client", label: "Client idéal", defaultValue: defaults.ideal_client },
                { name: "age_range", label: "Âge", defaultValue: defaults.age_range },
                {
                  name: "pain_points",
                  label: "Problématiques",
                  type: "textarea",
                  defaultValue: defaults.pain_points,
                },
                { name: "goals", label: "Objectifs", type: "textarea", defaultValue: defaults.goals },
                {
                  name: "services",
                  label: "Vos services (un par ligne)",
                  type: "textarea",
                  defaultValue: defaults.services?.join("\n"),
                },
                {
                  name: "advantages",
                  label: "Vos avantages",
                  type: "textarea",
                  defaultValue: defaults.advantages,
                },
              ]}
              error={avatar.state?.error}
              pending={avatar.pending}
            />
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step-2"
            action={positioning.formAction}
            className="space-y-4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <StepFields
              fields={[
                { name: "promise", label: "Votre promesse", type: "textarea", defaultValue: defaults.promise },
                { name: "values", label: "Vos valeurs", type: "textarea", defaultValue: defaults.values },
                {
                  name: "competitors",
                  label: "Concurrents",
                  type: "textarea",
                  defaultValue: defaults.competitors,
                },
              ]}
              error={positioning.state?.error}
              pending={positioning.pending}
            />
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step-3"
            action={branding.formAction}
            className="space-y-4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <StepFields
              fields={[
                { name: "logo_url", label: "URL du logo", defaultValue: defaults.logo_url },
                {
                  name: "colors",
                  label: "Couleurs (une par ligne, hex)",
                  type: "textarea",
                  defaultValue: defaults.colors?.join("\n"),
                },
                {
                  name: "fonts",
                  label: "Typographies (une par ligne)",
                  type: "textarea",
                  defaultValue: defaults.fonts?.join("\n"),
                },
                {
                  name: "inspirations",
                  label: "Inspirations (lien par ligne)",
                  type: "textarea",
                  defaultValue: defaults.inspirations?.join("\n"),
                },
              ]}
              error={branding.state?.error}
              pending={branding.pending}
              submitLabel="Terminer l'onboarding"
            />
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepFields({
  fields,
  error,
  pending,
  submitLabel = "Continuer",
}: {
  fields: { name: string; label: string; type?: "text" | "textarea"; defaultValue?: string | null }[];
  error?: string;
  pending: boolean;
  submitLabel?: string;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
          >
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                defaultValue={field.defaultValue ?? ""}
                rows={4}
              />
            ) : (
              <Input id={field.name} name={field.name} defaultValue={field.defaultValue ?? ""} />
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : submitLabel}
      </Button>
    </>
  );
}
