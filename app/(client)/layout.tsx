import { PortalNav } from "@/components/client-portal/portal-nav";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/[0.06] bg-background/50 px-6 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a75ff] to-[#0052d4] text-primary-foreground text-sm font-bold glow-primary">
            O
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Espace client <span className="text-primary">Osiris</span>
          </span>
        </div>
        <PortalNav />
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
