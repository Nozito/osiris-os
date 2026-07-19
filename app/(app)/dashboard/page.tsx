import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RevenueChartLazy } from "@/components/dashboard/revenue-chart-lazy";
import { CountUp } from "@/components/dashboard/count-up";
import { DashboardShortcuts } from "@/components/dashboard/dashboard-shortcuts";
import { PipelineBreakdown } from "@/components/dashboard/pipeline-breakdown";
import { LeadsToFollowUp } from "@/components/dashboard/leads-to-follow-up";
import { QuotesPending } from "@/components/dashboard/quotes-pending";
import { InvoicesToWatch } from "@/components/dashboard/invoices-to-watch";
import { ProjectsInProgress } from "@/components/dashboard/projects-in-progress";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageHeader, StatRow } from "@/components/layout/page-header";
import {
  getDashboardKpis,
  getRevenueTrend,
  getPipelineBreakdown,
  getLeadsToFollowUp,
  getQuotesPending,
  getInvoicesToWatch,
  getProjectsInProgress,
  getActivityFeed,
} from "./kpis";

export default async function DashboardPage() {
  const [kpis, revenueTrend, pipeline, leads, quotes, invoices, projects, activity] =
    await Promise.all([
      getDashboardKpis(),
      getRevenueTrend(),
      getPipelineBreakdown(),
      getLeadsToFollowUp(),
      getQuotesPending(),
      getInvoicesToWatch(),
      getProjectsInProgress(),
      getActivityFeed(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="order-1"
        title="Vue d'ensemble"
        description="Indicateurs commerciaux, financiers et production en temps réel."
      />

      {/* Rangée 1 — KPI + raccourcis */}
      <div className="order-2 flex flex-wrap items-start gap-3">
        <StatRow
          className="flex-1"
          items={[
            { label: "CA signé", value: <CountUp value={kpis.caSigne} format="currency" />, tone: "primary" },
            { label: "Leads actifs", value: <CountUp value={kpis.leadsActifs} /> },
            { label: "Devis en attente", value: <CountUp value={kpis.devisEnvoyes} /> },
            {
              label: "Factures en retard",
              value: <CountUp value={kpis.facturesEnRetard} />,
              tone: kpis.facturesEnRetard > 0 ? "primary" : "default",
            },
            { label: "Projets actifs", value: <CountUp value={kpis.projetsActifs} /> },
          ]}
        />
        <DashboardShortcuts />
      </div>

      {/*
        Rangée "listes actionnables" vs "CA/pipeline" : sur mobile, ce qui
        demande une action (leads/devis/factures/projets à traiter) doit
        primer sur le graphe — inversé à partir de md. Même contenu, juste
        réordonné en CSS, pas de duplication de rendu.
      */}
      <div className="order-3 grid grid-cols-1 gap-4 md:order-4 md:grid-cols-2">
        <LeadsToFollowUp leads={leads} />
        <QuotesPending quotes={quotes} />
        <InvoicesToWatch invoices={invoices} />
        <ProjectsInProgress projects={projects} />
      </div>

      <div className="order-4 grid grid-cols-1 gap-4 md:order-3 md:grid-cols-3">
        <Card className="relative overflow-hidden border-t-2 border-t-primary md:col-span-2">
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
            <RevenueChartLazy data={revenueTrend} />
          </CardContent>
        </Card>

        <PipelineBreakdown stages={pipeline} />
      </div>

      {/* Rangée 5 — activité récente */}
      <div className="order-5">
        <ActivityFeed events={activity} />
      </div>
    </div>
  );
}
