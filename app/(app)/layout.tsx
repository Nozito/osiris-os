import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandPalette } from "@/components/layout/command-palette";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <AppTopbar />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
        <AppBottomNav />
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
