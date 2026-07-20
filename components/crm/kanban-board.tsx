"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LeadCard } from "@/components/crm/lead-card";
import { LeadDetailSheet, type LeadDetail } from "@/components/crm/lead-detail-sheet";
import { updateLeadStatus } from "@/app/(app)/crm/actions";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import type { Database } from "@/types/database.types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const COLUMN_ACCENT: Record<LeadStatus, string> = {
  new: "bg-white/25",
  qualification: "bg-[#6ba4ff]",
  meeting: "bg-[#f2a93c]",
  quote_sent: "bg-primary",
  signed: "bg-[color-mix(in_oklch,var(--success),white_10%)]",
  lost: "bg-white/15",
};

const COLUMN_SURFACE: Record<LeadStatus, string> = {
  new: "bg-white/[0.015]",
  qualification: "bg-white/[0.015]",
  meeting: "bg-white/[0.015]",
  quote_sent: "bg-primary/[0.025]",
  signed: "bg-[color-mix(in_oklch,var(--success),transparent_96%)]",
  lost: "bg-white/[0.008] opacity-75",
};

export function KanbanBoard({
  leads,
  canDelete,
}: {
  leads: LeadDetail[];
  canDelete: boolean;
}) {
  const [items, setItems] = useState(leads);
  useEffect(() => setItems(leads), [leads]);
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [edgeFade, setEdgeFade] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateFade() {
      if (!el) return;
      setEdgeFade({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    }

    updateFade();
    el.addEventListener("scroll", updateFade, { passive: true });
    const resizeObserver = new ResizeObserver(updateFade);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFade);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  function moveLead(leadId: string, status: LeadStatus) {
    const previousStatus = items.find((lead) => lead.id === leadId)?.status;
    if (previousStatus === status) return;

    setItems((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    );
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, status);
      } catch {
        toast.error("Impossible de déplacer ce lead, réessayez.");
        setItems((prev) =>
          prev.map((lead) =>
            lead.id === leadId && previousStatus ? { ...lead, status: previousStatus } : lead
          )
        );
      }
    });
  }

  return (
    <>
      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-[2] w-10 bg-gradient-to-r from-background to-transparent transition-opacity duration-(--duration-base)",
            edgeFade.left ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-gradient-to-l from-background to-transparent transition-opacity duration-(--duration-base)",
            edgeFade.right ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          ref={scrollRef}
          className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]"
        >
          {LEAD_STATUSES.map((status) => {
            const columnLeads = items.filter((l) => l.status === status);
            const isDragOver = dragOverColumn === status;
            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverColumn(status);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragOverColumn((s) => (s === status ? null : s));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const leadId = e.dataTransfer.getData("text/lead-id");
                  if (leadId) moveLead(leadId, status);
                  setDragOverColumn(null);
                  setDraggingId(null);
                }}
                className={cn(
                  "flex w-[280px] shrink-0 snap-start flex-col rounded-xl border border-border transition-[border-color,background-color] duration-(--duration-fast)",
                  COLUMN_SURFACE[status],
                  isDragOver && "border-primary/50 bg-primary/[0.04] ring-1 ring-primary/30"
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", COLUMN_ACCENT[status])} />
                    <p className="text-[12.5px] font-medium text-foreground/85">
                      {LEAD_STATUS_LABELS[status]}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
                  {columnLeads.length === 0 ? (
                    <div
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-lg border border-dashed text-[11px] transition-[opacity,border-color,color] duration-(--duration-fast)",
                        isDragOver
                          ? "border-primary/40 text-primary opacity-100"
                          : "border-border text-muted-foreground/60 opacity-100"
                      )}
                    >
                      {isDragOver ? "Déposer ici" : "Vide"}
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={cn(
                          "transition-opacity duration-(--duration-fast)",
                          draggingId === lead.id && "opacity-40"
                        )}
                      >
                        <LeadCard
                          lead={{
                            id: lead.id,
                            name: lead.name,
                            company: lead.company,
                            budget: lead.budget,
                            urgency: lead.urgency,
                            totalScore: lead.scores?.total_score ?? null,
                            status: lead.status as LeadStatus,
                          }}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/lead-id", lead.id);
                            setDraggingId(lead.id);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDragOverColumn(null);
                          }}
                          onClick={() => setSelected(lead)}
                          onStatusChange={(nextStatus) => moveLead(lead.id, nextStatus)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LeadDetailSheet
        lead={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        canDelete={canDelete}
      />
    </>
  );
}
