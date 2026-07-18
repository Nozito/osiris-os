import { Download, Receipt, UserX } from "lucide-react";
import { getClientForCurrentUser } from "../data";
import { createClient } from "@/lib/supabase/server";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { computeTotals } from "@/lib/validations/quote";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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

export default async function ClientInvoicesPage() {
  const client = await getClientForCurrentUser();

  if (!client) {
    return (
      <EmptyState
        icon={UserX}
        title="Aucun espace client associé"
        description="Contactez votre interlocuteur Osiris Agency pour lier votre compte."
      />
    );
  }

  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, status, vat_rate, due_at, invoice_items(quantity, unit_price)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="page-title">Vos factures</h2>
      <p className="text-sm text-muted-foreground">
        Paiement par virement bancaire uniquement.
      </p>

      {!invoices || invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune facture pour l'instant"
          description="Vos factures apparaîtront ici dès qu'Osiris Agency vous en aura émis une."
        />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead className="text-right">Échéance</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const totals = computeTotals(invoice.invoice_items ?? [], invoice.vat_rate);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        render={
                          <a href={`/api/pdf/invoice/${invoice.id}`} target="_blank" />
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
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
