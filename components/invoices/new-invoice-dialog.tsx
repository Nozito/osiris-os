"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ItemsEditor } from "@/components/billing/items-editor";
import { createInvoice } from "@/app/(app)/invoices/actions";

export function NewInvoiceDialog({
  clients,
}: {
  clients: { id: string; company_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createInvoice, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle facture</DialogTitle>
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
              <Label htmlFor="due_at">Échéance</Label>
              <DatePicker id="due_at" name="due_at" />
            </div>
          </div>

          <ItemsEditor />

          <p className="text-xs text-muted-foreground">
            Paiement par virement bancaire uniquement (V1).
          </p>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
              Annuler
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
