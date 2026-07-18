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

type Section = {
  title: string;
  description?: string;
  fields: Field[];
};

export function SectionForm({
  action,
  sections,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  sections: Section[];
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
    <form action={formAction} className="space-y-6">
      {sections.map((section, i) => (
        <div
          key={section.title}
          className={i > 0 ? "space-y-4 border-t border-border pt-6" : "space-y-4"}
        >
          <div>
            <p className="section-title">{section.title}</p>
            {section.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
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
        </div>
      ))}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
