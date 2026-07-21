"use client";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "Faible", value: 20 },
  { label: "Moyen", value: 50 },
  { label: "Fort", value: 80 },
];

/** Three-tap alternative to a 0-100 slider — nobody knows what "63" means for
 * a lead's budget fit, but "Faible/Moyen/Fort" needs no calibration. */
export function ScoreQuickPick({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      <input type="hidden" name={name} value={value} />
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "h-8 flex-1 rounded-lg border text-xs font-medium transition-colors duration-(--duration-fast)",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
