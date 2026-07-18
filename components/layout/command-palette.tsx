"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Settings,
  Plus,
  Search,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  group: string;
  icon: typeof LayoutDashboard;
  href: string;
  keywords?: string;
};

const ITEMS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", group: "Naviguer", icon: LayoutDashboard, href: "/dashboard" },
  { id: "crm", label: "CRM", group: "Naviguer", icon: KanbanSquare, href: "/crm", keywords: "leads pipeline" },
  { id: "clients", label: "Clients", group: "Naviguer", icon: Users, href: "/clients" },
  { id: "projects", label: "Projets", group: "Naviguer", icon: FolderKanban, href: "/projects" },
  { id: "quotes", label: "Devis", group: "Naviguer", icon: FileText, href: "/quotes" },
  { id: "invoices", label: "Factures", group: "Naviguer", icon: Receipt, href: "/invoices" },
  { id: "settings", label: "Paramètres", group: "Naviguer", icon: Settings, href: "/settings" },
  { id: "new-client", label: "Nouveau client", group: "Créer", icon: Plus, href: "/clients?new=1", keywords: "ajouter" },
  { id: "new-lead", label: "Nouveau lead", group: "Créer", icon: Plus, href: "/crm?new=1", keywords: "prospect ajouter" },
  { id: "new-project", label: "Nouveau projet", group: "Créer", icon: Plus, href: "/projects?new=1", keywords: "ajouter" },
  { id: "new-quote", label: "Nouveau devis", group: "Créer", icon: Plus, href: "/quotes?new=1", keywords: "ajouter" },
  { id: "new-invoice", label: "Nouvelle facture", group: "Créer", icon: Plus, href: "/invoices?new=1", keywords: "ajouter" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.keywords?.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = groups.get(item.group) ?? [];
      list.push(item);
      groups.set(item.group, list);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  function select(item: CommandItem) {
    router.push(item.href);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) select(item);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] max-w-lg translate-y-0 gap-0 p-0"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une page ou une action..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            Échap
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Aucun résultat pour &quot;{query}&quot;
            </p>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-2 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {group}
                </p>
                {items.map((item) => {
                  const globalIndex = filtered.indexOf(item);
                  const active = globalIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                      onClick={() => select(item)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-(--duration-fast)",
                        active ? "bg-white/[0.07] text-foreground" : "text-foreground/85"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
