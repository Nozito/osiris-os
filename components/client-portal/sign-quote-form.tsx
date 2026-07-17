"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signQuote, updateQuoteStatus } from "@/app/(app)/quotes/actions";

export function SignQuoteForm({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [checked, setChecked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSign() {
    if (!name.trim() || !checked) return;
    startTransition(async () => {
      try {
        await signQuote(quoteId, name.trim());
        toast.success("Devis signé, merci !");
        router.refresh();
      } catch {
        toast.error("Échec de la signature.");
      }
    });
  }

  function handleRefuse() {
    startTransition(async () => {
      try {
        await updateQuoteStatus(quoteId, "refused");
        router.refresh();
      } catch {
        toast.error("Une erreur est survenue.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-medium">Signature électronique</p>
      <div className="space-y-1.5">
        <Label htmlFor="signed_by_name">Nom du signataire</Label>
        <Input
          id="signed_by_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prénom Nom"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="accent-primary"
        />
        Je valide ce devis et j&apos;en accepte les conditions
      </label>
      <p className="text-xs text-muted-foreground">
        Date : {new Date().toLocaleDateString("fr-FR")}
      </p>
      <div className="flex gap-2">
        <Button disabled={!name.trim() || !checked || isPending} onClick={handleSign}>
          Signer le devis
        </Button>
        <Button variant="outline" disabled={isPending} onClick={handleRefuse}>
          Refuser
        </Button>
      </div>
    </div>
  );
}
