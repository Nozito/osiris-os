"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/login/actions";

const LINKS = [
  { href: "/client", label: "Accueil" },
  { href: "/client/quotes", label: "Devis" },
  { href: "/client/invoices", label: "Factures" },
  { href: "/client/documents", label: "Documents" },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-4 md:flex">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative py-1.5 text-sm transition-colors duration-(--duration-fast)",
              active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-[1px] h-px bg-primary" />
            )}
          </Link>
        );
      })}
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground"
        >
          Déconnexion
        </button>
      </form>
    </nav>
  );
}
