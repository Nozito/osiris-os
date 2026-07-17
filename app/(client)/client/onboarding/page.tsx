import { redirect } from "next/navigation";
import { getClientForCurrentUser } from "../data";
import { OnboardingWizard } from "@/components/client-portal/onboarding-wizard";

export default async function OnboardingPage() {
  const client = await getClientForCurrentUser();

  if (!client) {
    redirect("/client");
  }

  const profile = client.client_business_profiles;
  const branding = client.client_branding;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Onboarding</h2>
        <p className="text-sm text-muted-foreground">
          Ces informations nous permettent de démarrer votre projet dans les
          meilleures conditions.
        </p>
      </div>

      <OnboardingWizard
        clientId={client.id}
        defaults={{
          company_name: client.company_name,
          contact_name: client.contact_name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          sector: client.sector,
          current_website: client.current_website,
          ideal_client: profile?.ideal_client,
          age_range: profile?.age_range,
          pain_points: profile?.pain_points,
          goals: profile?.goals,
          services: profile?.services as string[] | null,
          advantages: profile?.advantages,
          promise: profile?.promise,
          values: profile?.values,
          competitors: profile?.competitors,
          logo_url: branding?.logo_url,
          colors: branding?.colors as string[] | null,
          fonts: branding?.fonts as string[] | null,
          inspirations: branding?.inspirations as string[] | null,
        }}
      />
    </div>
  );
}
