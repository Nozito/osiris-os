import Link from "next/link";
import { UserPlus, FileText, FolderKanban, Receipt } from "lucide-react";

const SHORTCUTS = [
  { href: "/crm?new=1", label: "Lead", icon: UserPlus },
  { href: "/quotes?new=1", label: "Devis", icon: FileText },
  { href: "/projects?new=1", label: "Projet", icon: FolderKanban },
  { href: "/invoices?new=1", label: "Facture", icon: Receipt },
];

/** Reuses the existing `?new=1` auto-open dialogs (lib/use-auto-open.ts) — no new mechanism. */
export function DashboardShortcuts() {
  return (
    <div className="flex items-center gap-1.5">
      {SHORTCUTS.map((shortcut) => (
        <Link
          key={shortcut.href}
          href={shortcut.href}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors duration-(--duration-fast) hover:border-white/20 hover:text-foreground"
        >
          <shortcut.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{shortcut.label}</span>
        </Link>
      ))}
    </div>
  );
}
