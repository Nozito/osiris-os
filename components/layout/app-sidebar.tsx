"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Search,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { OsirisMark } from "@/components/layout/osiris-mark";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { useLogout } from "@/lib/use-logout";
import { cn } from "@/lib/utils";

type SidebarCounts = {
  devisEnvoyes: number;
  facturesEnRetard: number;
};

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  countKey?: keyof SidebarCounts;
  tone?: "default" | "destructive";
};

/** The agency's real pipeline, in order — this order *is* the navigation's structure. */
const STAGES: NavItem[] = [
  { title: "Vue d'ensemble", url: "/dashboard", icon: LayoutDashboard },
  { title: "CRM", url: "/crm", icon: KanbanSquare },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Projets", url: "/projects", icon: FolderKanban },
  { title: "Devis", url: "/quotes", icon: FileText, countKey: "devisEnvoyes" },
  {
    title: "Factures",
    url: "/invoices",
    icon: Receipt,
    countKey: "facturesEnRetard",
    tone: "destructive",
  },
];

/** Must match the `h-11` row height below — used to compute the rail fill height. */
const ROW_HEIGHT = 44;

const HALO_STYLE = {
  background: "radial-gradient(circle, rgba(0,102,255,0.35), transparent 70%)",
};

function RailRow({
  item,
  isActive,
  count,
}: {
  item: NavItem;
  isActive: boolean;
  count?: number;
}) {
  const hasCount = !!count && count > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.url} />}
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          "h-11 gap-3 p-0 px-2 transition-colors duration-(--duration-fast)",
          "hover:bg-transparent data-open:hover:bg-transparent data-active:bg-transparent",
          isActive ? "text-foreground" : "text-foreground/55 hover:text-foreground/80"
        )}
      >
        <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar">
          {isActive && (
            <span
              className="pointer-events-none absolute inset-[-5px] rounded-full opacity-80 blur-[6px]"
              style={HALO_STYLE}
            />
          )}
          <item.icon className="relative z-10 h-4 w-4" />
        </span>
        <span className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className={cn("truncate", isActive && "font-medium")}>{item.title}</span>
          {hasCount && (
            <span
              className={cn(
                "shrink-0 text-xs tabular-nums",
                item.tone === "destructive" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {count}
            </span>
          )}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  userName = "Utilisateur",
  userRoleLabel,
  counts,
}: {
  userName?: string;
  userRoleLabel?: string;
  counts?: SidebarCounts;
}) {
  const pathname = usePathname();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const logout = useLogout();
  const shouldReduceMotion = useReducedMotion();

  function isItemActive(url: string) {
    return pathname === url || pathname.startsWith(`${url}/`);
  }

  const activeIndex = STAGES.findIndex((item) => isItemActive(item.url));
  const fillHeight = activeIndex >= 0 ? activeIndex * ROW_HEIGHT + ROW_HEIGHT / 2 : 0;
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-2.5">
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="group relative flex flex-1 items-center gap-2.5 overflow-hidden">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span
                className="pointer-events-none absolute inset-[-6px] rounded-full opacity-70 blur-md"
                style={HALO_STYLE}
              />
              <OsirisMark size={22} className="relative" />
            </span>
            <span className="font-heading text-base font-bold tracking-tight transition-opacity duration-(--duration-base) group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:opacity-0">
              Osiris <span className="text-primary">OS</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5 group-data-[collapsible=icon]:hidden">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-sidebar-accent hover:text-foreground"
              title="Rechercher (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="sr-only">Rechercher</span>
            </button>
            <NotificationsDropdown />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-1 pb-0">
          <SidebarGroupContent className="relative">
            {/* Rail line: expanded mode only — collapsed relies on node + halo alone (see plan). */}
            <span className="absolute top-0 bottom-0 left-[22px] w-px bg-sidebar-border group-data-[collapsible=icon]:hidden" />
            <motion.span
              className="absolute top-0 left-[22px] w-px bg-primary group-data-[collapsible=icon]:hidden"
              animate={{ height: fillHeight }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 520, damping: 38 }
              }
            />
            <SidebarMenu className="gap-0 group-data-[collapsible=icon]:gap-0.5">
              {STAGES.map((item, i) => (
                <RailRow
                  key={item.url}
                  item={item}
                  isActive={i === activeIndex}
                  count={item.countKey && counts ? counts[item.countKey] : undefined}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2 border-t border-sidebar-border/60 pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/settings" />}
                  isActive={isItemActive("/settings")}
                  tooltip="Paramètres"
                  size="sm"
                  className="text-muted-foreground data-active:bg-transparent data-active:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Paramètres</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 px-2 pb-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-8 items-center justify-center gap-2 rounded-lg text-xs text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-sidebar-accent hover:text-foreground"
        >
          {isMobile ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Fermer</span>
            </>
          ) : collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronsLeft className="h-3.5 w-3.5" />
              <span>Réduire</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 rounded-lg border-t border-sidebar-border/60 p-2 pt-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-secondary text-xs font-medium">
            {initials}
          </span>
          <div className="min-w-0 flex-1 transition-opacity duration-(--duration-base) group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{userName}</p>
            {userRoleLabel && (
              <p className="truncate text-xs text-muted-foreground">{userRoleLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            title="Déconnexion"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="sr-only">Déconnexion</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
