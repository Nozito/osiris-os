"use client";

import { LayoutDashboard, KanbanSquare, Users, FolderKanban, Menu } from "lucide-react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { useSidebar } from "@/components/ui/sidebar";

const ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "CRM", href: "/crm", icon: KanbanSquare },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projets", href: "/projects", icon: FolderKanban },
];

export function AppBottomNav() {
  const { setOpenMobile } = useSidebar();

  return (
    <MobileBottomNav
      items={ITEMS}
      more={{
        label: "Plus",
        icon: Menu,
        onClick: () => setOpenMobile(true),
      }}
    />
  );
}
