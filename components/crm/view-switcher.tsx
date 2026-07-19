"use client";

import { cn } from "@/lib/utils";

export type ViewOption<T extends string> = { value: T; label: string; icon: React.ElementType };

export function ViewSwitcher<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ViewOption<T>[];
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-white/[0.02] p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-(--duration-fast)",
              active
                ? "bg-white/[0.08] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <option.icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
