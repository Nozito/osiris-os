import Link from "next/link";
import { FolderKanban, UserX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientForCurrentUser } from "./data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  design: "Design",
  development: "Développement",
  client_validation: "Validation client",
  live: "En ligne",
  maintenance: "Maintenance",
};

export default async function ClientHomePage() {
  const client = await getClientForCurrentUser();

  if (!client) {
    return (
      <EmptyState
        icon={UserX}
        title="Aucun espace client associé"
        description="Contactez votre interlocuteur Osiris Agency pour lier votre compte."
      />
    );
  }

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, delivery_date")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const profileComplete = Boolean(client.client_business_profiles?.promise);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Bienvenue,</p>
        <h1 className="page-title text-[1.75rem]">{client.company_name}</h1>
      </div>

      {!profileComplete && (
        <Card className="glass border-primary/20">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">Complétez votre onboarding</p>
              <p className="text-sm text-muted-foreground">
                Quelques informations à renseigner pour démarrer votre projet.
              </p>
            </div>
            <Button render={<Link href="/client/onboarding" />}>Continuer</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <p className="section-title text-muted-foreground">Vos projets</p>

        {!projects || projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet en cours"
            description="Vos projets apparaîtront ici dès qu'Osiris Agency en aura démarré un."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/client/projects/${project.id}`} className="block">
                <Card className="h-full transition-[border-color,box-shadow,transform] duration-(--duration-base) ease-(--ease-premium) hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-md)]">
                  <CardHeader className="flex-row items-center justify-between pb-0">
                    <p className="font-heading text-sm font-medium">{project.name}</p>
                    <Badge variant="secondary">
                      {STATUS_LABELS[project.status] ?? project.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {project.delivery_date && (
                      <p className="text-xs text-muted-foreground">
                        Livraison prévue :{" "}
                        {new Date(project.delivery_date).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
