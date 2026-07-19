import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionForm } from "@/components/clients/section-form";
import {
  updateClientInfo,
  updateBusinessProfile,
  updateBranding,
} from "../actions";
import { ProjectsTab } from "@/components/clients/projects-tab";
import { DocumentsTab } from "@/components/clients/documents-tab";
import { AiOfferPanelLazy } from "@/components/clients/ai-offer-panel-lazy";
import { AiWebStrategyPanelLazy } from "@/components/clients/ai-web-strategy-panel-lazy";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: profile }, { data: branding }, { data: projects }, { data: documents }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("client_business_profiles").select("*").eq("client_id", id).maybeSingle(),
      supabase.from("client_branding").select("*").eq("client_id", id).maybeSingle(),
      supabase
        .from("projects")
        .select("id, name, status, budget, delivery_date")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, file_name, file_type, category, created_at, storage_path")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 shrink-0">
          <AvatarFallback className="bg-secondary text-sm">
            {client.company_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold tracking-tight">
            {client.company_name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {client.sector ? (
              <Badge variant="secondary">{client.sector}</Badge>
            ) : (
              <span>Secteur non renseigné</span>
            )}
            {(projects?.length ?? 0) > 0 && (
              <span>
                {projects!.length} projet{projects!.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="infos">
        <TabsList>
          <TabsTrigger value="infos">Infos générales</TabsTrigger>
          <TabsTrigger value="avatar">Avatar client</TabsTrigger>
          <TabsTrigger value="offre">Offre</TabsTrigger>
          <TabsTrigger value="positionnement">Positionnement</TabsTrigger>
          <TabsTrigger value="branding">Direction artistique</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="projets">Projets</TabsTrigger>
        </TabsList>

        <TabsContent value="infos" className="pt-4">
          <SectionForm
            action={updateClientInfo.bind(null, id)}
            sections={[
              {
                title: "Identité",
                fields: [
                  { name: "company_name", label: "Entreprise", defaultValue: client.company_name },
                  { name: "contact_name", label: "Contact", defaultValue: client.contact_name },
                  { name: "sector", label: "Secteur", defaultValue: client.sector },
                ],
              },
              {
                title: "Coordonnées",
                fields: [
                  { name: "email", label: "Email", defaultValue: client.email },
                  { name: "phone", label: "Téléphone", defaultValue: client.phone },
                  { name: "address", label: "Adresse", defaultValue: client.address },
                  {
                    name: "current_website",
                    label: "Site actuel",
                    defaultValue: client.current_website,
                  },
                ],
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="avatar" className="pt-4">
          <SectionForm
            action={updateBusinessProfile.bind(null, id)}
            sections={[
              {
                title: "Profil",
                description: "Qui est le client type de cette entreprise.",
                fields: [
                  { name: "ideal_client", label: "Client idéal", defaultValue: profile?.ideal_client },
                  { name: "age_range", label: "Âge", defaultValue: profile?.age_range },
                  { name: "situation", label: "Situation", defaultValue: profile?.situation },
                  {
                    name: "avg_budget",
                    label: "Budget moyen (€)",
                    type: "number",
                    defaultValue: profile?.avg_budget,
                  },
                ],
              },
              {
                title: "Motivations",
                fields: [
                  {
                    name: "pain_points",
                    label: "Problématiques",
                    type: "textarea",
                    defaultValue: profile?.pain_points,
                  },
                  { name: "goals", label: "Objectifs", type: "textarea", defaultValue: profile?.goals },
                  {
                    name: "objections",
                    label: "Objections",
                    type: "textarea",
                    defaultValue: profile?.objections,
                  },
                ],
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="offre" className="pt-4">
          <SectionForm
            action={updateBusinessProfile.bind(null, id)}
            sections={[
              {
                title: "Catalogue",
                fields: [
                  {
                    name: "services",
                    label: "Services (un par ligne)",
                    type: "textarea",
                    defaultValue: (profile?.services as string[] | null)?.join("\n"),
                  },
                  {
                    name: "products",
                    label: "Produits (un par ligne)",
                    type: "textarea",
                    defaultValue: (profile?.products as string[] | null)?.join("\n"),
                  },
                ],
              },
              {
                title: "Positionnement offre",
                fields: [
                  {
                    name: "advantages",
                    label: "Avantages",
                    type: "textarea",
                    defaultValue: profile?.advantages,
                  },
                  {
                    name: "differentiation",
                    label: "Différenciation",
                    type: "textarea",
                    defaultValue: profile?.differentiation,
                  },
                ],
              },
            ]}
          />
          <div className="mt-6 border-t border-border pt-6">
            <AiOfferPanelLazy clientId={id} />
          </div>
        </TabsContent>

        <TabsContent value="positionnement" className="pt-4">
          <SectionForm
            action={updateBusinessProfile.bind(null, id)}
            sections={[
              {
                title: "Marque",
                fields: [
                  { name: "promise", label: "Promesse", type: "textarea", defaultValue: profile?.promise },
                  { name: "values", label: "Valeurs", type: "textarea", defaultValue: profile?.values },
                  {
                    name: "communication_tone",
                    label: "Ton de communication",
                    defaultValue: profile?.communication_tone,
                  },
                ],
              },
              {
                title: "Marché",
                fields: [
                  {
                    name: "competitors",
                    label: "Concurrents",
                    type: "textarea",
                    defaultValue: profile?.competitors,
                  },
                ],
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="branding" className="pt-4">
          <SectionForm
            action={updateBranding.bind(null, id)}
            sections={[
              {
                title: "Identité visuelle",
                fields: [
                  { name: "logo_url", label: "URL du logo", defaultValue: branding?.logo_url },
                  {
                    name: "colors",
                    label: "Couleurs (une par ligne, hex)",
                    type: "textarea",
                    defaultValue: (branding?.colors as string[] | null)?.join("\n"),
                  },
                  {
                    name: "fonts",
                    label: "Typographies (une par ligne)",
                    type: "textarea",
                    defaultValue: (branding?.fonts as string[] | null)?.join("\n"),
                  },
                ],
              },
              {
                title: "Références",
                fields: [
                  {
                    name: "inspirations",
                    label: "Inspirations (lien par ligne)",
                    type: "textarea",
                    defaultValue: (branding?.inspirations as string[] | null)?.join("\n"),
                  },
                ],
              },
            ]}
          />
          <div className="mt-6 border-t border-border pt-6">
            <AiWebStrategyPanelLazy clientId={id} />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          <DocumentsTab clientId={id} documents={documents ?? []} />
        </TabsContent>

        <TabsContent value="projets" className="pt-4">
          <ProjectsTab clientId={id} projects={projects ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
