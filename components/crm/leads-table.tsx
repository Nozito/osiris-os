"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadDetailSheet, type LeadDetail } from "@/components/crm/lead-detail-sheet";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/validations/lead";
import { cn } from "@/lib/utils";

type LeadStatus = (typeof LEAD_STATUSES)[number];

const STATUS_TONE: Record<LeadStatus, "secondary" | "warning" | "success" | "destructive"> = {
  new: "secondary",
  qualification: "secondary",
  meeting: "warning",
  quote_sent: "warning",
  signed: "success",
  lost: "destructive",
};

type SortKey = "name" | "status" | "budget" | "score";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 text-xs font-medium transition-colors duration-(--duration-fast)",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </TableHead>
  );
}

export function LeadsTable({
  leads,
  canDelete,
}: {
  leads: LeadDetail[];
  canDelete: boolean;
}) {
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.company ?? "").toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else if (sortKey === "status") diff = a.status.localeCompare(b.status);
      else if (sortKey === "budget") diff = (a.budget ?? 0) - (b.budget ?? 0);
      else if (sortKey === "score")
        diff = (a.scores?.total_score ?? 0) - (b.scores?.total_score ?? 0);
      return sortDir === "asc" ? diff : -diff;
    });

    return result;
  }, [leads, query, statusFilter, sortKey, sortDir]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[10rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un lead..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun lead ne correspond"
          description="Ajustez la recherche ou le filtre de statut."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader
                    label="NOM"
                    active={sortKey === "name"}
                    dir={sortDir}
                    onClick={() => toggleSort("name")}
                  />
                  <TableHead className="text-xs font-medium text-muted-foreground">SOURCE</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">BESOIN</TableHead>
                  <SortHeader
                    label="STATUT"
                    active={sortKey === "status"}
                    dir={sortDir}
                    onClick={() => toggleSort("status")}
                  />
                  <SortHeader
                    label="BUDGET"
                    active={sortKey === "budget"}
                    dir={sortDir}
                    onClick={() => toggleSort("budget")}
                    className="text-right"
                  />
                  <SortHeader
                    label="SCORE"
                    active={sortKey === "score"}
                    dir={sortDir}
                    onClick={() => toggleSort("score")}
                    className="text-right"
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(lead)}
                  >
                    <TableCell>
                      <span className="font-medium">{lead.name}</span>
                      {lead.company && (
                        <span className="block text-xs text-muted-foreground">{lead.company}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.source || "—"}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">
                      {lead.need || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_TONE[lead.status as LeadStatus]}>
                        {LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {lead.budget ? `${lead.budget.toLocaleString("fr-FR")} €` : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {lead.scores?.total_score ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 sm:hidden">
            {filtered.map((lead, i) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelected(lead)}
                className="animate-fade-in-up flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-[var(--shadow-xs)] transition-colors duration-(--duration-fast) active:bg-white/[0.03]"
                style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.company || lead.source || "—"}
                  </p>
                </div>
                <Badge variant={STATUS_TONE[lead.status as LeadStatus]} className="shrink-0">
                  {LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                </Badge>
              </button>
            ))}
          </div>
        </>
      )}

      <LeadDetailSheet
        lead={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        canDelete={canDelete}
      />
    </div>
  );
}
