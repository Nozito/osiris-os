import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QuoteStatusBadge } from "@/components/quotes/status-badge";
import type { Database } from "@/types/database.types";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

type Quote = {
  id: string;
  number: string | null;
  status: Database["public"]["Enums"]["quote_status"];
  clientName: string;
  ttc: number;
};

export function QuotesPending({ quotes }: { quotes: Quote[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <p className="section-title">Devis en attente</p>
        <Link href="/quotes" className="text-xs text-muted-foreground hover:text-foreground">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun devis en attente"
            description="Les devis envoyés à vos clients apparaîtront ici jusqu'à leur réponse."
            action={
              <Link href="/quotes?new=1" className="text-xs text-primary hover:underline">
                Créer un devis
              </Link>
            }
            className="border-none bg-transparent py-4"
          />
        ) : (
          <div className="divide-y divide-border">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="-mx-(--card-spacing) flex items-center justify-between gap-3 rounded-md px-(--card-spacing) py-2.5 transition-colors duration-(--duration-fast) first:pt-0 last:pb-0 hover:bg-white/[0.03] hover:text-primary active:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{quote.number}</p>
                  <p className="truncate text-xs text-muted-foreground">{quote.clientName}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="stat-value text-xs">{formatEUR(quote.ttc)}</span>
                  <QuoteStatusBadge status={quote.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
