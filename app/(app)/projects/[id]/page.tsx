import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/projects/status-select";
import { StatusTimeline } from "@/components/projects/status-timeline";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="page-title">{project.name}</h2>
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
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{project.description || "Aucune description."}</p>
              <div className="grid grid-cols-3 gap-3 text-foreground">
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p>{project.budget ? `${project.budget.toLocaleString("fr-FR")} €` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Début</p>
                  <p>
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString("fr-FR")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Livraison</p>
                  <p>
                    {project.delivery_date
                      ? new Date(project.delivery_date).toLocaleDateString("fr-FR")
                      : "—"}
                  </p>
                </div>
              </div>
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
