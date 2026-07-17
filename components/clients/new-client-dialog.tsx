"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClientRecord } from "@/app/(app)/clients/actions";
import { clientSchema } from "@/lib/validations/client";

type FieldName = keyof typeof clientSchema.shape;

export function NewClientDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createClientRecord, undefined);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  function validate(name: FieldName, value: string) {
    const result = clientSchema.shape[name].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  function errorClass(name: FieldName) {
    return cn(fieldErrors[name] && "border-destructive focus-visible:ring-destructive/40");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFieldErrors({});
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Entreprise *</Label>
            <Input
              id="company_name"
              name="company_name"
              required
              className={errorClass("company_name")}
              onBlur={(e) => validate("company_name", e.target.value)}
            />
            {fieldErrors.company_name && (
              <p className="animate-in fade-in-0 slide-in-from-top-1 text-xs text-destructive duration-150">
                {fieldErrors.company_name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact_name">Contact</Label>
              <Input id="contact_name" name="contact_name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sector">Secteur</Label>
              <Input id="sector" name="sector" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className={errorClass("email")}
                onBlur={(e) => e.target.value && validate("email", e.target.value)}
              />
              {fieldErrors.email && (
                <p className="animate-in fade-in-0 slide-in-from-top-1 text-xs text-destructive duration-150">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="current_website">Site actuel</Label>
            <Input id="current_website" name="current_website" placeholder="https://" />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
              Annuler
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Création..." : "Créer le client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
