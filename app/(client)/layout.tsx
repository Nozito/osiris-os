import { PortalNav } from "@/components/client-portal/portal-nav";
import { OsirisMark } from "@/components/layout/osiris-mark";

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
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
