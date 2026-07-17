import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, budget, delivery_date, clients(company_name)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, company_name").order("company_name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Projets</h2>
          <p className="text-sm text-muted-foreground">
            {projects?.length ?? 0} projet{(projects?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <NewProjectDialog clients={clients ?? []} />
      </div>

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet pour l'instant"
          description="Lancez votre premier projet pour un client existant."
          action={<NewProjectDialog clients={clients ?? []} />}
        />
      ) : (
        <div className="rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Livraison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.clients?.company_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {project.delivery_date
                      ? new Date(project.delivery_date).toLocaleDateString("fr-FR")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
