"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProject } from "@/app/(app)/projects/actions";

export function NewProjectDialog({
  clients,
}: {
  clients: { id: string; company_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProject, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
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
            <Label htmlFor="name">Nom du projet *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (€)</Label>
              <Input id="budget" name="budget" type="number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Début</Label>
              <DatePicker id="start_date" name="start_date" placeholder="Date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delivery_date">Livraison</Label>
              <DatePicker id="delivery_date" name="delivery_date" placeholder="Date" />
            </div>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
              Annuler
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Création..." : "Créer le projet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
