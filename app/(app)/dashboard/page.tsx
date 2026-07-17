import { Users, FileText, Euro, FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CountUp } from "@/components/dashboard/count-up";
import { getDashboardKpis, getRevenueTrend } from "./kpis";

export default async function DashboardPage() {
  const [kpis, revenueTrend] = await Promise.all([
    getDashboardKpis(),
    getRevenueTrend(),
  ]);

  const kpiCards: {
    label: string;
    value: number;
    icon: typeof Users;
    format?: "number" | "currency";
  }[] = [
    { label: "Leads actifs", value: kpis.leadsActifs, icon: Users },
    { label: "Devis envoyés", value: kpis.devisEnvoyes, icon: FileText },
    { label: "CA signé", value: kpis.caSigne, icon: Euro, format: "currency" },
    { label: "Projets actifs", value: kpis.projetsActifs, icon: FolderKanban },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Vue d&apos;ensemble</h2>
        <p className="text-sm text-muted-foreground">
          Indicateurs commerciaux, financiers et production en temps réel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="group">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <kpi.icon className="h-3.5 w-3.5" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="stat-value text-2xl">
                <CountUp value={kpi.value} format={kpi.format} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium">Évolution du CA encaissé</p>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueTrend} />
        </CardContent>
      </Card>
    </div>
  );
}
