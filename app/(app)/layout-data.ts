import { createClient } from "@/lib/supabase/server";

/** Real counts surfaced as sidebar badges — same filters as the dashboard KPIs. */
export async function getSidebarCounts() {
  const supabase = await createClient();

  const [{ count: devisEnvoyes }, { count: facturesEnRetard }] = await Promise.all([
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .in("status", ["sent", "viewed"]),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "overdue"),
  ]);

  return {
    devisEnvoyes: devisEnvoyes ?? 0,
    facturesEnRetard: facturesEnRetard ?? 0,
  };
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  employee: "Collaborateur",
  client: "Client",
};

/** The signed-in staff member, for the sidebar account footer. */
export async function getCurrentAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    name: profile?.full_name || user.email || "Utilisateur",
    email: user.email ?? undefined,
    roleLabel: profile ? ROLE_LABELS[profile.role] : undefined,
  };
}
