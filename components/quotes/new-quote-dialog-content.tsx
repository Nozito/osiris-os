"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ItemsEditor } from "@/components/billing/items-editor";
import { createQuote } from "@/app/(app)/quotes/actions";

export function NewQuoteDialogContent({
  clients,
}: {
  clients: { id: string; company_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createQuote, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Nouveau devis</DialogTitle>
      </DialogHeader>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="client_id">Client *</Label>
            <Select name="client_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valid_until">Valable jusqu&apos;au</Label>
            <DatePicker id="valid_until" name="valid_until" />
          </div>
        </div>

        <ItemsEditor />

        <div className="space-y-1.5 rounded-lg border border-border bg-white/[0.015] p-3">
          <Label htmlFor="terms" className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Conditions générales
          </Label>
          <Textarea id="terms" name="terms" rows={3} />
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div className="flex gap-2">
          <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
            Annuler
          </DialogClose>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? "Création..." : "Créer le devis"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
