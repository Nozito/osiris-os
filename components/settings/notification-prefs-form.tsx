"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateNotificationPrefs } from "@/app/(app)/settings/actions";

function Toggle({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-(--duration-fast) disabled:opacity-50",
        checked ? "bg-primary" : "bg-white/[0.12]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-(--duration-fast)",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

export function NotificationPrefsForm({
  notifyOnQuoteSigned,
}: {
  notifyOnQuoteSigned: boolean;
}) {
  const [value, setValue] = useState(notifyOnQuoteSigned);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setValue(next);
    startTransition(async () => {
      try {
        await updateNotificationPrefs({ notify_on_quote_signed: next });
      } catch {
        setValue(!next);
        toast.error("Impossible d'enregistrer la préférence.");
      }
    });
  }

  return (
    <div className="max-w-sm">
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="pr-4">
          <p className="text-sm font-medium">Devis signé</p>
          <p className="text-xs text-muted-foreground">
            Recevoir une notification quand un client signe un devis.
          </p>
        </div>
        <Toggle checked={value} onCheckedChange={handleChange} disabled={isPending} />
      </div>
    </div>
  );
}
