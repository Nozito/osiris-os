import { FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  design: "Design",
  development: "Développement",
  client_validation: "Validation client",
  live: "En ligne",
  maintenance: "Maintenance",
};

export function ProjectsTab({
  projects,
}: {
  clientId: string;
  projects: {
    id: string;
    name: string;
    status: string;
    budget: number | null;
    delivery_date: string | null;
  }[];
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Aucun projet pour ce client"
        description="Lancez un premier projet depuis l'onglet Projets."
      />
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div>
            <p className="text-sm font-medium">{project.name}</p>
            {project.delivery_date && (
              <p className="text-xs text-muted-foreground">
                Livraison : {new Date(project.delivery_date).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {project.budget && (
              <span className="text-sm text-muted-foreground">
                {project.budget.toLocaleString("fr-FR")} €
              </span>
            )}
            <Badge variant="secondary">{STATUS_LABELS[project.status] ?? project.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
