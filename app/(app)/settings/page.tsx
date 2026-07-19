import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  employee: "Collaborateur",
  client: "Client",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const initials = (profile?.full_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader description="Votre compte et vos préférences." />

      <Tabs defaultValue="compte" orientation="vertical" className="sm:flex-row sm:gap-8">
        <TabsList className="sm:w-44 sm:shrink-0 sm:items-stretch sm:border-0 sm:bg-transparent sm:p-0">
          <TabsTrigger value="compte">Compte</TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="equipe" disabled>
            Équipe
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="compte" className="space-y-6">
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

            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Nom</span>
                <span>{profile?.full_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Rôle</span>
                <Badge variant="secondary">
                  {profile ? ROLE_LABELS[profile.role] : "—"}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" />
          <TabsContent value="equipe" />
        </div>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Notifications et gestion d&apos;équipe arrivent prochainement.
      </p>
    </div>
  );
}
