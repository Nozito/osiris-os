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
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <form action={signOut}>
        <button
          type="submit"
          className="ml-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Déconnexion
        </button>
      </form>
    </nav>
  );
}
