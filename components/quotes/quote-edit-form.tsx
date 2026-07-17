"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ItemsEditor } from "@/components/billing/items-editor";
import { updateQuote } from "@/app/(app)/quotes/actions";

export function QuoteEditForm({
  quote,
  items,
}: {
  quote: {
    id: string;
    client_id: string;
    project_id: string | null;
    vat_rate: number;
    terms: string | null;
    valid_until: string | null;
  };
  items: { label: string; description: string | null; quantity: number; unit_price: number }[];
}) {
  const [state, formAction, pending] = useActionState(
    updateQuote.bind(null, quote.id),
    undefined
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) toast.error(state.error);
      else toast.success("Devis enregistré");
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="client_id" value={quote.client_id} />
      {quote.project_id && <input type="hidden" name="project_id" value={quote.project_id} />}

      <div className="space-y-1.5">
        <Label htmlFor="valid_until">Valable jusqu&apos;au</Label>
        <DatePicker
          id="valid_until"
          name="valid_until"
          defaultValue={quote.valid_until}
        />
      </div>

      <ItemsEditor
        defaultItems={items.map((item) => ({
          label: item.label,
          description: item.description ?? "",
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))}
        defaultVatRate={quote.vat_rate}
      />

      <div className="space-y-1.5 rounded-lg border border-border/60 bg-white/[0.015] p-3">
        <Label htmlFor="terms" className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Conditions générales
        </Label>
        <Textarea id="terms" name="terms" rows={3} defaultValue={quote.terms ?? ""} />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
