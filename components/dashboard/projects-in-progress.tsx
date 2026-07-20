import Link from "next/link";
import { FolderKanban, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import type { Database } from "@/types/database.types";

type Project = {
  id: string;
  name: string;
  status: Database["public"]["Enums"]["project_status"];
  deliveryDate: string | null;
  clientName: string;
  atRisk: boolean;
};

export function ProjectsInProgress({ projects }: { projects: Project[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <p className="section-title">Projets en cours</p>
        <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet en cours"
            description="Les projets actifs, avec livraison la plus proche en premier, apparaîtront ici."
            action={
              <Link href="/projects?new=1" className="text-xs text-primary hover:underline">
                Lancer un projet
              </Link>
            }
            className="border-none bg-transparent py-4"
          />
        ) : (
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="-mx-(--card-spacing) flex items-center justify-between gap-3 rounded-md px-(--card-spacing) py-2.5 transition-colors duration-(--duration-fast) first:pt-0 last:pb-0 hover:bg-white/[0.03] hover:text-primary active:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{project.clientName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {project.atRisk ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      À risque
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{PROJECT_STATUS_LABELS[project.status]}</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
