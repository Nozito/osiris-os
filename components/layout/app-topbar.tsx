"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTriggerAdaptive } from "@/components/layout/sidebar-trigger-adaptive";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { OsirisMark } from "@/components/layout/osiris-mark";

const PAGE_TITLES: Record<string, { title: string; group?: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/crm": { title: "CRM", group: "Commercial" },
  "/clients": { title: "Clients", group: "Commercial" },
  "/projects": { title: "Projets", group: "Commercial" },
  "/quotes": { title: "Devis", group: "Facturation" },
  "/invoices": { title: "Factures", group: "Facturation" },
  "/settings": { title: "Paramètres" },
};

function infoForPath(pathname: string) {
  const match = Object.keys(PAGE_TITLES).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  return match ? PAGE_TITLES[match] : { title: "Osiris OS" };
}

export function AppTopbar() {
  const pathname = usePathname();
  const { title, group } = infoForPath(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTriggerAdaptive className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <OsirisMark size={24} className="md:hidden" />
      <div className="flex flex-1 items-baseline gap-1.5 text-sm tracking-tight">
        {group && (
          <>
            <span className="text-muted-foreground/70">{group}</span>
            <span className="text-muted-foreground/40">/</span>
          </>
        )}
        <h1 className="font-heading font-bold text-foreground/90">{title}</h1>
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        className="hidden items-center gap-2 rounded-md border border-border bg-transparent px-2.5 py-1.5 text-xs text-muted-foreground transition-colors duration-(--duration-fast) hover:border-white/20 hover:text-foreground sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        Rechercher
        <kbd className="ml-2 rounded border border-border bg-white/[0.04] px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>
      <NotificationsDropdown />
    </header>
  );
}
