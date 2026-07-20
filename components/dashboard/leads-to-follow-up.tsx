import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LEAD_STATUS_LABELS } from "@/lib/validations/lead";

type Lead = { id: string; name: string; company: string | null; status: string; score: number };

export function LeadsToFollowUp({ leads }: { leads: Lead[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <p className="section-title">Leads à traiter</p>
        <Link href="/crm" className="text-xs text-muted-foreground hover:text-foreground">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun lead à traiter"
            description="Les leads actifs, triés par score, apparaîtront ici."
            action={
              <Link href="/crm?new=1" className="text-xs text-primary hover:underline">
                Ajouter un lead
              </Link>
            }
            className="border-none bg-transparent py-4"
          />
        ) : (
          <div className="divide-y divide-border">
            {leads.map((lead) => (
              <Link
                key={lead.id}
                href="/crm"
                className="-mx-(--card-spacing) flex items-center justify-between gap-3 rounded-md px-(--card-spacing) py-2.5 transition-colors duration-(--duration-fast) first:pt-0 last:pb-0 hover:bg-white/[0.03] hover:text-primary active:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.company || LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 tabular-nums">
                  {lead.score}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
