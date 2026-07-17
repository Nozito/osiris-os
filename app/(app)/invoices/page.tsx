import Link from "next/link";
import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewInvoiceDialog } from "@/components/invoices/new-invoice-dialog";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { computeTotals } from "@/lib/validations/quote";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default async function InvoicesPage() {
  const supabase = await createClient();
  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "id, number, status, vat_rate, due_at, clients(company_name), invoice_items(quantity, unit_price)"
      )
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, company_name").order("company_name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Factures</h2>
          <p className="text-sm text-muted-foreground">
            {invoices?.length ?? 0} facture{(invoices?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <NewInvoiceDialog clients={clients ?? []} />
      </div>

      {!invoices || invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune facture pour l'instant"
          description="Créez votre première facture, indépendante ou depuis un devis accepté."
          action={<NewInvoiceDialog clients={clients ?? []} />}
        />
      ) : (
        <div className="rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead className="text-right">Échéance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const totals = computeTotals(invoice.invoice_items ?? [], invoice.vat_rate);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.clients?.company_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatEUR(totals.ttc)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {invoice.due_at
                        ? new Date(invoice.due_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
