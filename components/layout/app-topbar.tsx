"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTriggerAdaptive } from "@/components/layout/sidebar-trigger-adaptive";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/crm": "CRM",
  "/clients": "Clients",
  "/projects": "Projets",
  "/quotes": "Devis",
  "/invoices": "Factures",
  "/settings": "Paramètres",
};

function titleForPath(pathname: string) {
  const match = Object.keys(PAGE_TITLES).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  return match ? PAGE_TITLES[match] : "Osiris OS";
}

export function AppTopbar() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-none border-x-0 border-t-0 px-4 shadow-none">
      <SidebarTriggerAdaptive className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="flex-1 text-sm font-medium tracking-tight text-foreground/90">
        {titleForPath(pathname)}
      </h1>
      <NotificationsDropdown />
    </header>
  );
}
