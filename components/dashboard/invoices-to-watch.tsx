import Link from "next/link";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import type { Database } from "@/types/database.types";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

type Invoice = {
  id: string;
  number: string | null;
  status: Database["public"]["Enums"]["invoice_status"];
  dueAt: string | null;
  clientName: string;
  ttc: number;
};

export function InvoicesToWatch({ invoices }: { invoices: Invoice[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <p className="section-title">Factures à surveiller</p>
        <Link href="/invoices" className="text-xs text-muted-foreground hover:text-foreground">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Rien à surveiller"
            description="Les factures en retard ou proches de l'échéance apparaîtront ici."
            action={
              <Link href="/invoices?new=1" className="text-xs text-primary hover:underline">
                Créer une facture
              </Link>
            }
            className="border-none bg-transparent py-4"
          />
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 transition-colors duration-(--duration-fast) hover:text-primary"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{invoice.number}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {invoice.clientName}
                    {invoice.dueAt &&
                      ` · éch. ${new Date(invoice.dueAt).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="stat-value text-xs">{formatEUR(invoice.ttc)}</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
