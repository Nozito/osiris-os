import { OsirisMark } from "@/components/layout/osiris-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="relative hidden overflow-hidden border-r border-border bg-[#050505] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(760px 480px at 15% 8%, rgba(0,102,255,0.16), transparent 60%), radial-gradient(560px 420px at 85% 92%, rgba(0,102,255,0.08), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <OsirisMark
          variant="watermark"
          size={560}
          className="pointer-events-none absolute -right-28 -bottom-32 -rotate-6 opacity-[0.05]"
        />

        <OsirisMark size={36} className="relative" />

        <div className="relative max-w-md space-y-4">
          <p className="font-heading text-2xl leading-tight font-bold tracking-tight text-balance">
            L&apos;espace de pilotage pour les projets Osiris Agency.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            CRM, devis, factures et suivi projet réunis dans un seul outil interne —
            de la prospection à la livraison client.
          </p>
        </div>

        <p className="relative text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Osiris Agency
        </p>
      </div>

      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-10">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
