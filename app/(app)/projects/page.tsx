import Link from "next/link";
import { FolderKanban, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowLink,
} from "@/components/ui/table";

const STATUS_TONE: Record<string, "secondary" | "warning" | "success"> = {
  onboarding: "secondary",
  design: "secondary",
  development: "warning",
  client_validation: "warning",
  live: "success",
  maintenance: "secondary",
};

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
      <PageHeader
        description={`${projects?.length ?? 0} projet${(projects?.length ?? 0) > 1 ? "s" : ""} en portefeuille de production.`}
        actions={<NewProjectDialog clients={clients ?? []} />}
      />

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet pour l'instant"
          description="Lancez votre premier projet pour un client existant."
          action={<NewProjectDialog clients={clients ?? []} />}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Livraison</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="group">
                    <TableRowLink href={`/projects/${project.id}`} />
                    <TableCell>
                      <span className="font-medium group-hover:text-primary">
                        {project.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {project.clients?.company_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_TONE[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {project.delivery_date
                        ? new Date(project.delivery_date).toLocaleDateString("fr-FR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-(--duration-fast) group-hover:opacity-100" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 sm:hidden">
            {projects.map((project, i) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-xs)] transition-colors duration-(--duration-fast) active:bg-white/[0.03]"
                style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.clients?.company_name ?? "—"}
                  </p>
                </div>
                <Badge variant={STATUS_TONE[project.status]} className="shrink-0">
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
