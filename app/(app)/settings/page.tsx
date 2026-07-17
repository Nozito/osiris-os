import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Paramètres</h2>
        <p className="page-subtitle">Votre compte et vos préférences.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <p className="section-title">Compte</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Nom</span>
            <span>{profile?.full_name || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rôle</span>
            <Badge variant="secondary">
              {profile ? ROLE_LABELS[profile.role] : "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Plus d&apos;options (notifications, apparence, équipe) arrivent prochainement.
      </p>
    </div>
  );
}
