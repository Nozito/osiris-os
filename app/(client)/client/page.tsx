import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getClientForCurrentUser } from "./data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Aucun espace client n&apos;est encore associé à votre compte. Contactez
        votre interlocuteur Osiris Agency.
      </div>
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
    <div className="space-y-6">
      {!profileComplete && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
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

      <div>
        <h2 className="page-title">Vos projets</h2>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          Aucun projet en cours pour l&apos;instant.
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/client/projects/${project.id}`} className="block">
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader className="flex-row items-center justify-between pb-0">
                  <p className="text-sm font-medium">{project.name}</p>
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
  );
}
