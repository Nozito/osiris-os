"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/app/(app)/clients/actions";

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  defaultValue?: string | number | null;
};

export function SectionForm({
  action,
  fields,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Field[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) toast.error(state.error);
      else toast.success("Enregistré");
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={
              field.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"
            }
          >
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? ""}
                rows={4}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type === "number" ? "number" : "text"}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? ""}
              />
            )}
          </div>
        ))}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
