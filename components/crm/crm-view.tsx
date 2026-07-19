"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { KanbanSquare, List } from "lucide-react";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { LeadsTable } from "@/components/crm/leads-table";
import { ViewSwitcher } from "@/components/crm/view-switcher";
import type { LeadDetail } from "@/components/crm/lead-detail-sheet";

type View = "kanban" | "list";

const OPTIONS = [
  { value: "kanban" as const, label: "Kanban", icon: KanbanSquare },
  { value: "list" as const, label: "Liste", icon: List },
];

export function CrmView({
  leads,
  canDelete,
}: {
  leads: LeadDetail[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view: View = searchParams.get("view") === "list" ? "list" : "kanban";

  const setView = useCallback(
    (next: View) => {
      const params = new URLSearchParams(searchParams);
      if (next === "kanban") params.delete("view");
      else params.set("view", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-4">
      <ViewSwitcher value={view} onChange={setView} options={OPTIONS} />
      {view === "kanban" ? (
        <KanbanBoard leads={leads} canDelete={canDelete} />
      ) : (
        <LeadsTable leads={leads} canDelete={canDelete} />
      )}
    </div>
  );
}
