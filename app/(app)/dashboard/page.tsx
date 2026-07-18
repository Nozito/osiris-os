import { Users, FileText, FolderKanban, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CountUp } from "@/components/dashboard/count-up";
import { getDashboardKpis, getRevenueTrend } from "./kpis";

export default async function DashboardPage() {
  const [kpis, revenueTrend] = await Promise.all([
    getDashboardKpis(),
    getRevenueTrend(),
  ]);

  const secondaryStats: {
    label: string;
    value: number;
    icon: typeof Users;
    tone: "primary" | "muted";
  }[] = [
    { label: "Leads actifs", value: kpis.leadsActifs, icon: Users, tone: "primary" },
    { label: "Devis envoyés", value: kpis.devisEnvoyes, icon: FileText, tone: "muted" },
    { label: "Projets actifs", value: kpis.projetsActifs, icon: FolderKanban, tone: "muted" },
  ];

  const toneClasses: Record<string, string> = {
    primary: "bg-primary/[0.12] text-primary",
    muted: "bg-white/[0.05] text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Vue d&apos;ensemble</h2>
        <p className="page-subtitle">
          Indicateurs commerciaux, financiers et production en temps réel.
        </p>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryStats.map((stat, i) => (
          <Card
            key={stat.label}
            size="sm"
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <CardContent className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[stat.tone]}`}
              >
                <stat.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className="stat-value text-xl leading-tight">
                  <CountUp value={stat.value} />
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
