import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoices/status-badge";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { computeTotals } from "@/lib/validations/quote";
import { getCurrentRole } from "@/lib/get-current-role";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: invoice }, role] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, clients(id, company_name), invoice_items(*)")
      .eq("id", id)
      .single(),
    getCurrentRole(),
  ]);

  if (!invoice) notFound();

  const items = (invoice.invoice_items ?? []).sort((a, b) => a.position - b.position);
  const totals = computeTotals(items, invoice.vat_rate);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight">{invoice.number}</h2>
          <p className="text-sm text-muted-foreground">{invoice.clients?.company_name}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <InvoiceActions invoiceId={invoice.id} status={invoice.status} canDelete={role === "admin"} />

      <Card>
        <CardHeader>
          <p className="section-title">Détail</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">
                  {item.quantity} × {formatEUR(item.unit_price)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-border pt-3 text-right text-sm">
            <p className="text-muted-foreground">
              HT <span className="ml-3 text-foreground/80">{formatEUR(totals.ht)}</span>
            </p>
            <p className="text-muted-foreground">
              TVA ({invoice.vat_rate}%)
              <span className="ml-3 text-foreground/80">{formatEUR(totals.vat)}</span>
            </p>
            <p className="pt-1 text-muted-foreground">
              TTC
              <span className="stat-value ml-3 text-lg text-foreground">
                {formatEUR(totals.ttc)}
              </span>
            </p>
          </div>
          {invoice.due_at && (
            <p className="text-xs text-muted-foreground">
              Échéance : {new Date(invoice.due_at).toLocaleDateString("fr-FR")} — paiement par
              virement bancaire
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
