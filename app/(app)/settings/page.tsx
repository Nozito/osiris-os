import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { MfaSection } from "@/components/settings/mfa-section";
import { NotificationPrefsForm } from "@/components/settings/notification-prefs-form";
import { TeamSection } from "@/components/settings/team-section";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  employee: "Collaborateur",
  client: "Client",
};

async function getTeamMembers() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["admin", "employee"])
    .order("full_name");

  if (!profiles || profiles.length === 0) return [];

  // profiles has no email column — cross-reference auth.users via the admin
  // API, only ever done here, gated behind the admin-only tab this feeds.
  const admin = createAdminClient();
  const emailById = new Map<string, string>();
  const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of usersPage?.users ?? []) {
    if (u.email) emailById.set(u.id, u.email);
  }

  return profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role as "admin" | "employee",
    email: emailById.get(p.id) ?? null,
  }));
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const isAdmin = profile?.role === "admin";
  const team = isAdmin ? await getTeamMembers() : [];

  const initials = (profile?.full_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Votre compte, votre sécurité et vos préférences." />

      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-heading text-base font-bold tracking-tight">
            {profile?.full_name || "—"}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {profile ? ROLE_LABELS[profile.role] : "—"}
        </Badge>
      </div>

      <Tabs defaultValue="profil" orientation="vertical" className="flex-col gap-6 sm:flex-row sm:gap-8">
        <TabsList className="sm:w-44 sm:shrink-0 sm:items-stretch sm:border-0 sm:bg-transparent sm:p-0">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="securite">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="equipe">Équipe</TabsTrigger>}
        </TabsList>

        <div className="flex-1">
          <TabsContent value="profil">
            <ProfileForm
              fullName={profile?.full_name || ""}
              email={user?.email || ""}
              pendingEmail={user?.new_email}
            />
          </TabsContent>

          <TabsContent value="securite" className="space-y-8">
            <div>
              <p className="section-title mb-3">Mot de passe</p>
              <PasswordForm />
            </div>
            <div className="border-t border-border pt-6">
              <p className="section-title mb-3">Vérification en deux étapes</p>
              <MfaSection />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPrefsForm notifyOnQuoteSigned={profile?.notify_on_quote_signed ?? true} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="equipe">
              <TeamSection members={team} currentUserId={user?.id ?? ""} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
