"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "@/app/(auth)/login/actions";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "CRM", url: "/crm", icon: KanbanSquare },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Projets", url: "/projects", icon: FolderKanban },
  { title: "Devis", url: "/quotes", icon: FileText },
  { title: "Factures", url: "/invoices", icon: Receipt },
];

export function AppSidebar({
  userName = "Utilisateur",
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-4 group-data-[collapsible=icon]:px-2.5">
        <Link href="/dashboard" className="group relative flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1a75ff] to-[#0052d4] text-[13px] font-bold text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_0_0_1px_rgba(0,102,255,0.3)] transition-transform duration-(--duration-base) ease-(--ease-premium) group-hover:scale-105">
            O
          </span>
          <span className="text-sm font-semibold tracking-tight transition-opacity duration-(--duration-base) group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:opacity-0">
            Osiris <span className="text-primary">OS</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="relative text-foreground/70 transition-colors duration-(--duration-fast) data-active:bg-transparent data-active:font-medium data-active:text-primary [&_svg]:relative [&_svg]:z-10 [&_svg]:transition-colors [&_svg]:data-active:text-primary"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 z-0 rounded-md bg-primary/[0.1] shadow-[inset_2px_0_0_0_var(--primary)]"
                          transition={{ type: "spring", stiffness: 520, damping: 38 }}
                        />
                      )}
                      <item.icon />
                      <span className="relative z-10">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronsLeft className="h-3.5 w-3.5" />
              <span>Réduire</span>
            </>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors duration-(--duration-fast) hover:bg-sidebar-accent" />
            }
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-secondary text-xs">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 transition-opacity duration-(--duration-base) group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{userName}</p>
              {userEmail && (
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              render={
                <form action={signOut}>
                  <button type="submit" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </button>
                </form>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
