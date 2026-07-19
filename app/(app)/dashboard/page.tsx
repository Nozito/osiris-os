import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CountUp } from "@/components/dashboard/count-up";
import { PageHeader, StatRow } from "@/components/layout/page-header";
import { getDashboardKpis, getRevenueTrend } from "./kpis";

export default async function DashboardPage() {
  const [kpis, revenueTrend] = await Promise.all([
    getDashboardKpis(),
    getRevenueTrend(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader description="Indicateurs commerciaux, financiers et production en temps réel." />

      <Card className="relative overflow-hidden border-t-2 border-t-primary">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              CA signé
            </div>
            <p className="stat-value mt-2 text-[2.75rem] leading-none">
              <CountUp value={kpis.caSigne} format="currency" />
            </p>
          </div>
          <p className="pt-1 text-xs text-muted-foreground">
            Évolution du CA encaissé
          </p>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueTrend} />
        </CardContent>
      </Card>

      <StatRow
        items={[
          { label: "Leads actifs", value: <CountUp value={kpis.leadsActifs} />, tone: "primary" },
          { label: "Devis envoyés", value: <CountUp value={kpis.devisEnvoyes} /> },
          { label: "Projets actifs", value: <CountUp value={kpis.projetsActifs} /> },
        ]}
      />
    </div>
  );
}
