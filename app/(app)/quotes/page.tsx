import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewQuoteDialog } from "@/components/quotes/new-quote-dialog";
import { QuoteStatusBadge } from "@/components/quotes/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
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

export default async function QuotesPage() {
  const supabase = await createClient();
  const [{ data: quotes }, { data: clients }] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "id, number, status, vat_rate, created_at, clients(company_name), quote_items(quantity, unit_price)"
      )
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, company_name").order("company_name"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devis"
        description={`${quotes?.length ?? 0} devis émis.`}
        actions={<NewQuoteDialog clients={clients ?? []} />}
      />

      {!quotes || quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun devis pour l'instant"
          description="Créez votre premier devis pour lancer une négociation."
          action={<NewQuoteDialog clients={clients ?? []} />}
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
                  <TableHead className="text-right">Créé le</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => {
                  const totals = computeTotals(quote.quote_items ?? [], quote.vat_rate);
                  return (
                    <TableRow key={quote.id} className="group">
                      <TableRowLink href={`/quotes/${quote.id}`} />
                      <TableCell>
                        <span className="font-medium group-hover:text-primary">
                          {quote.number}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {quote.clients?.company_name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <QuoteStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEUR(totals.ttc)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString("fr-FR")}
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
            {quotes.map((quote, i) => {
              const totals = computeTotals(quote.quote_items ?? [], quote.vat_rate);
              return (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-xs)] transition-colors duration-(--duration-fast) active:bg-white/[0.03]"
                  style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">{quote.number}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {quote.clients?.company_name ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="stat-value text-sm">{formatEUR(totals.ttc)}</span>
                    <QuoteStatusBadge status={quote.status} />
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
