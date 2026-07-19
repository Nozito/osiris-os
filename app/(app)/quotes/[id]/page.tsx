import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/quotes/status-badge";
import { QuoteActions } from "@/components/quotes/quote-actions";
import { QuoteEditForm } from "@/components/quotes/quote-edit-form";
import { computeTotals } from "@/lib/validations/quote";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(id, company_name), quote_items(*)")
    .eq("id", id)
    .single();

  if (!quote) notFound();

  const items = (quote.quote_items ?? []).sort((a, b) => a.position - b.position);
  const totals = computeTotals(items, quote.vat_rate);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight">{quote.number}</h2>
          <p className="text-sm text-muted-foreground">{quote.clients?.company_name}</p>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <QuoteActions quoteId={quote.id} status={quote.status} />

      {quote.status === "draft" ? (
        <Card>
          <CardHeader>
            <p className="section-title">Modifier le devis</p>
          </CardHeader>
          <CardContent>
            <QuoteEditForm quote={quote} items={items} />
          </CardContent>
        </Card>
      ) : (
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
                TVA ({quote.vat_rate}%)
                <span className="ml-3 text-foreground/80">{formatEUR(totals.vat)}</span>
              </p>
              <p className="pt-1 text-muted-foreground">
                TTC
                <span className="stat-value ml-3 text-lg text-foreground">
                  {formatEUR(totals.ttc)}
                </span>
              </p>
            </div>
            {quote.signed_by_name && (
              <p className="text-xs text-muted-foreground">
                Signé par {quote.signed_by_name} le{" "}
                {quote.signed_at && new Date(quote.signed_at).toLocaleString("fr-FR")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
