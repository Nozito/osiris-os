import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/projects/status-select";
import { StatusTimeline } from "@/components/projects/status-timeline";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatRow } from "@/components/layout/page-header";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: history }] = await Promise.all([
    supabase.from("projects").select("*, clients(id, company_name)").eq("id", id).single(),
    supabase
      .from("project_status_history")
      .select("id, to_status, created_at, note")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold tracking-tight">{project.name}</h2>
          <Link
            href={`/clients/${project.clients?.id}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {project.clients?.company_name}
          </Link>
        </div>
        <StatusSelect projectId={project.id} status={project.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <p className="section-title">Description</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{project.description || "Aucune description."}</p>
              <StatRow
                items={[
                  {
                    label: "Budget",
                    value: project.budget
                      ? `${project.budget.toLocaleString("fr-FR")} €`
                      : "—",
                  },
                  {
                    label: "Début",
                    value: project.start_date
                      ? new Date(project.start_date).toLocaleDateString("fr-FR")
                      : "—",
                  },
                  {
                    label: "Livraison",
                    value: project.delivery_date
                      ? new Date(project.delivery_date).toLocaleDateString("fr-FR")
                      : "—",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <p className="section-title">Historique</p>
          </CardHeader>
          <CardContent>
            <StatusTimeline history={history ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
