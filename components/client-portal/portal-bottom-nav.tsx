"use client";

import { Home, FileText, Receipt, FolderOpen } from "lucide-react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const ITEMS = [
  { label: "Accueil", href: "/client", icon: Home },
  { label: "Devis", href: "/client/quotes", icon: FileText },
  { label: "Factures", href: "/client/invoices", icon: Receipt },
  { label: "Documents", href: "/client/documents", icon: FolderOpen },
];

export function PortalBottomNav() {
  return <MobileBottomNav items={ITEMS} />;
}
