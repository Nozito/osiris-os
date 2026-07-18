import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusTimeline } from "@/components/projects/status-timeline";
import { PROJECT_STATUS_LABELS, PROJECT_NEXT_STEP } from "@/lib/validations/project";
import type { Database } from "@/types/database.types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

const PROGRESS: Record<ProjectStatus, number> = {
  onboarding: 10,
  design: 30,
  development: 55,
  client_validation: 80,
  live: 100,
  maintenance: 100,
};

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: history }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("project_status_history")
      .select("id, to_status, created_at, note")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">{project.name}</h2>
        <p className="text-sm text-muted-foreground">
          {PROJECT_STATUS_LABELS[project.status]}
        </p>
      </div>

      <Card>
        <CardHeader>
          <p className="section-title">Progression</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={PROGRESS[project.status]} />
          <p className="text-sm text-muted-foreground">
            {PROJECT_NEXT_STEP[project.status]}
          </p>
          {project.delivery_date && (
            <p className="text-xs text-muted-foreground">
              Livraison prévue :{" "}
              {new Date(project.delivery_date).toLocaleDateString("fr-FR")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="section-title">Historique</p>
        </CardHeader>
        <CardContent>
          <StatusTimeline history={history ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
