import { createClient } from "@/lib/supabase/server";
import { getClientForCurrentUser } from "../data";
import { DocumentsTab } from "@/components/clients/documents-tab";

export default async function ClientDocumentsPage() {
  const client = await getClientForCurrentUser();

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Aucun espace client n&apos;est encore associé à votre compte.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, file_name, file_type, category, created_at, storage_path")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Devis, factures, contrats et fichiers partagés avec Osiris Agency.
        </p>
      </div>
      <DocumentsTab clientId={client.id} documents={documents ?? []} />
    </div>
  );
}
