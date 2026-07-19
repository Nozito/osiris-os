import Link from "next/link";
import { Receipt, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewInvoiceDialog } from "@/components/invoices/new-invoice-dialog";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, StatRow } from "@/components/layout/page-header";
import { computeTotals } from "@/lib/validations/quote";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowLink,
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

  const allTotals = (invoices ?? []).map((invoice) =>
    computeTotals(invoice.invoice_items ?? [], invoice.vat_rate).ttc
  );
  const totalBilled = allTotals.reduce((sum, ttc) => sum + ttc, 0);
  const totalPaid = (invoices ?? [])
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + computeTotals(invoice.invoice_items ?? [], invoice.vat_rate).ttc, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        description={`${invoices?.length ?? 0} facture${(invoices?.length ?? 0) > 1 ? "s" : ""} émise${(invoices?.length ?? 0) > 1 ? "s" : ""}.`}
        actions={<NewInvoiceDialog clients={clients ?? []} />}
      />

      {invoices && invoices.length > 0 && (
        <StatRow
          items={[
            { label: "Total facturé", value: formatEUR(totalBilled), tone: "primary" },
            { label: "Encaissé", value: formatEUR(totalPaid) },
            { label: "En attente", value: formatEUR(totalBilled - totalPaid) },
          ]}
        />
      )}

      {!invoices || invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune facture pour l'instant"
          description="Créez votre première facture, indépendante ou depuis un devis accepté."
          action={<NewInvoiceDialog clients={clients ?? []} />}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead className="text-right">Échéance</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const totals = computeTotals(invoice.invoice_items ?? [], invoice.vat_rate);
                  return (
                    <TableRow key={invoice.id} className="group">
                      <TableRowLink href={`/invoices/${invoice.id}`} />
                      <TableCell>
                        <span className="font-medium group-hover:text-primary">
                          {invoice.number}
                        </span>
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
                      <TableCell>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-(--duration-fast) group-hover:opacity-100" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 sm:hidden">
            {invoices.map((invoice, i) => {
              const totals = computeTotals(invoice.invoice_items ?? [], invoice.vat_rate);
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-xs)] transition-colors duration-(--duration-fast) active:bg-white/[0.03]"
                  style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">{invoice.number}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.clients?.company_name ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="stat-value text-sm">{formatEUR(totals.ttc)}</span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
