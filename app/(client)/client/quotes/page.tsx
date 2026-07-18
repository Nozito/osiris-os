import Link from "next/link";
import { FileText, UserX } from "lucide-react";
import { getClientForCurrentUser } from "../data";
import { createClient } from "@/lib/supabase/server";
import { QuoteStatusBadge } from "@/components/quotes/status-badge";
import { computeTotals } from "@/lib/validations/quote";
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

export default async function ClientQuotesPage() {
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
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, number, status, vat_rate, created_at, quote_items(quantity, unit_price)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="page-title">Vos devis</h2>

      {!quotes || quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun devis pour l'instant"
          description="Vos devis apparaîtront ici dès qu'Osiris Agency vous en aura envoyé un."
        />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const totals = computeTotals(quote.quote_items ?? [], quote.vat_rate);
                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Link
                        href={`/client/quotes/${quote.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {quote.number}
                      </Link>
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
