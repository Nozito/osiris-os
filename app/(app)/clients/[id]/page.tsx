import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionForm } from "@/components/clients/section-form";
import {
  updateClientInfo,
  updateBusinessProfile,
  updateBranding,
} from "../actions";
import { ProjectsTab } from "@/components/clients/projects-tab";
import { DocumentsTab } from "@/components/clients/documents-tab";
import { AiOfferPanel } from "@/components/clients/ai-offer-panel";
import { AiWebStrategyPanel } from "@/components/clients/ai-web-strategy-panel";

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
      <div>
        <h2 className="page-title">{client.company_name}</h2>
        <p className="text-sm text-muted-foreground">
          {client.sector || "Secteur non renseigné"}
        </p>
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
            fields={[
              { name: "company_name", label: "Entreprise", defaultValue: client.company_name },
              { name: "contact_name", label: "Contact", defaultValue: client.contact_name },
              { name: "email", label: "Email", defaultValue: client.email },
              { name: "phone", label: "Téléphone", defaultValue: client.phone },
              { name: "address", label: "Adresse", defaultValue: client.address },
              { name: "sector", label: "Secteur", defaultValue: client.sector },
              {
                name: "current_website",
                label: "Site actuel",
                defaultValue: client.current_website,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="avatar" className="pt-4">
          <SectionForm
            action={updateBusinessProfile.bind(null, id)}
            fields={[
              { name: "ideal_client", label: "Client idéal", defaultValue: profile?.ideal_client },
              { name: "age_range", label: "Âge", defaultValue: profile?.age_range },
              { name: "situation", label: "Situation", defaultValue: profile?.situation },
              {
                name: "avg_budget",
                label: "Budget moyen (€)",
                type: "number",
                defaultValue: profile?.avg_budget,
              },
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
            ]}
          />
        </TabsContent>

        <TabsContent value="offre" className="pt-4">
          <SectionForm
            action={updateBusinessProfile.bind(null, id)}
            fields={[
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
            ]}
          />
          <div className="mt-4">
            <AiOfferPanel clientId={id} />
          </div>
        </TabsContent>

        <TabsContent value="positionnement" className="pt-4">
          <SectionForm
            action={updateBusinessProfile.bind(null, id)}
            fields={[
              { name: "promise", label: "Promesse", type: "textarea", defaultValue: profile?.promise },
              { name: "values", label: "Valeurs", type: "textarea", defaultValue: profile?.values },
              {
                name: "competitors",
                label: "Concurrents",
                type: "textarea",
                defaultValue: profile?.competitors,
              },
              {
                name: "communication_tone",
                label: "Ton de communication",
                defaultValue: profile?.communication_tone,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="branding" className="pt-4">
          <SectionForm
            action={updateBranding.bind(null, id)}
            fields={[
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
              {
                name: "inspirations",
                label: "Inspirations (lien par ligne)",
                type: "textarea",
                defaultValue: (branding?.inspirations as string[] | null)?.join("\n"),
              },
            ]}
          />
          <div className="mt-4">
            <AiWebStrategyPanel clientId={id} />
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
