import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandPaletteLazy } from "@/components/layout/command-palette-lazy";
import { getSidebarCounts, getCurrentAccount } from "./layout-data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore, counts, account] = await Promise.all([
    cookies(),
    getSidebarCounts(),
    getCurrentAccount(),
  ]);
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar
        userName={account?.name}
        userRoleLabel={account?.roleLabel}
        counts={counts}
      />
      <SidebarInset className="bg-transparent">
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
        <AppBottomNav />
      </SidebarInset>
      <CommandPaletteLazy />
    </SidebarProvider>
  );
}
