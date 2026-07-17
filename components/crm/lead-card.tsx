"use client";

import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LeadCardData = {
  id: string;
  name: string;
  company: string | null;
  budget: number | null;
  urgency: string | null;
  totalScore: number | null;
};

function scoreStyles(score: number | null) {
  if (score === null) return "bg-white/[0.05] text-muted-foreground";
  if (score >= 80)
    return "bg-[color-mix(in_oklch,var(--success),transparent_85%)] text-[color-mix(in_oklch,var(--success),white_30%)]";
  if (score >= 50)
    return "bg-[color-mix(in_oklch,var(--warning),transparent_85%)] text-[color-mix(in_oklch,var(--warning),white_25%)]";
  return "bg-white/[0.05] text-muted-foreground";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LeadCard({
  lead,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
}: {
  lead: LeadCardData;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="group/lead-card w-full cursor-grab rounded-lg border border-border/70 bg-card p-3 text-left shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-(--duration-fast) ease-(--ease-premium) hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-[var(--shadow-sm)] active:cursor-grabbing active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-medium text-foreground/80">
            {initials(lead.name)}
          </span>
          <p className="truncate text-[13px] font-medium">{lead.name}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            scoreStyles(lead.totalScore)
          )}
        >
          {lead.totalScore ?? "—"}
        </span>
      </div>

      {(lead.company || lead.budget || lead.urgency) && (
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
          {lead.company ? (
            <span className="flex min-w-0 items-center gap-1">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.company}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex shrink-0 items-center gap-2 tabular-nums">
            {lead.budget && <span>{lead.budget.toLocaleString("fr-FR")} €</span>}
            {lead.urgency && (
              <span className="rounded bg-white/[0.04] px-1 py-0.5">{lead.urgency}</span>
            )}
          </span>
        </div>
      )}
    </button>
  );
}
