import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QuoteStatusBadge } from "@/components/quotes/status-badge";
import { SignQuoteForm } from "@/components/client-portal/sign-quote-form";
import { computeTotals } from "@/lib/validations/quote";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default async function ClientQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!quote) notFound();

  const items = (quote.quote_items ?? []).sort((a, b) => a.position - b.position);
  const totals = computeTotals(items, quote.vat_rate);
  const canSign = quote.status === "sent" || quote.status === "viewed";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="page-title">{quote.number}</h2>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <Button variant="secondary" render={<a href={`/api/pdf/quote/${quote.id}`} target="_blank" />}>
        <Download className="mr-2 h-4 w-4" />
        Télécharger le PDF
      </Button>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Détail</p>
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
          <div className="border-t border-border/60 pt-3 text-right text-sm">
            <p className="text-muted-foreground">HT : {formatEUR(totals.ht)}</p>
            <p className="text-muted-foreground">
              TVA ({quote.vat_rate}%) : {formatEUR(totals.vat)}
            </p>
            <p className="font-semibold">TTC : {formatEUR(totals.ttc)}</p>
          </div>
          {quote.terms && (
            <p className="text-xs text-muted-foreground">{quote.terms}</p>
          )}
          {quote.signed_by_name && (
            <p className="text-xs text-muted-foreground">
              Signé par {quote.signed_by_name} le{" "}
              {quote.signed_at && new Date(quote.signed_at).toLocaleDateString("fr-FR")}
            </p>
          )}
        </CardContent>
      </Card>

      {canSign && <SignQuoteForm quoteId={quote.id} />}
    </div>
  );
}
