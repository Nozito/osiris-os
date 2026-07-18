import { LogOut } from "lucide-react";
import { PortalNav } from "@/components/client-portal/portal-nav";
import { PortalBottomNav } from "@/components/client-portal/portal-bottom-nav";
import { OsirisMark } from "@/components/layout/osiris-mark";
import { signOut } from "@/app/(auth)/login/actions";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-10 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <OsirisMark size={32} />
            <span className="font-heading text-[15px] font-semibold tracking-tight">
              Espace client <span className="text-primary">Osiris</span>
            </span>
          </div>
          <PortalNav />
          <form action={signOut} className="md:hidden">
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Déconnexion</span>
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10 pb-24 md:pb-10">{children}</main>
      <PortalBottomNav />
    </div>
  );
}
