import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewQuoteDialog } from "@/components/quotes/new-quote-dialog";
import { QuoteStatusBadge } from "@/components/quotes/status-badge";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Devis</h2>
          <p className="text-sm text-muted-foreground">
            {quotes?.length ?? 0} devis
          </p>
        </div>
        <NewQuoteDialog clients={clients ?? []} />
      </div>

      {!quotes || quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun devis pour l'instant"
          description="Créez votre premier devis pour lancer une négociation."
          action={<NewQuoteDialog clients={clients ?? []} />}
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
                <TableHead className="text-right">Créé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const totals = computeTotals(quote.quote_items ?? [], quote.vat_rate);
                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {quote.number}
                      </Link>
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
