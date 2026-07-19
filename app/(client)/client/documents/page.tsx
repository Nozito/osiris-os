import { UserX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientForCurrentUser } from "../data";
import { DocumentsTab } from "@/components/clients/documents-tab";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ClientDocumentsPage() {
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
  const [{ data: documents }, { data: documentRequests }] = await Promise.all([
    // RLS (documents_select_own, 0013_invitations_and_documents.sql) already
    // excludes internal documents — no extra filtering needed here.
    supabase
      .from("documents")
      .select(
        "id, file_name, file_type, category, created_at, storage_path, visibility, stage, source, viewed_by_client_at"
      )
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("document_requests")
      .select("id, label, note, status, created_at")
      .eq("client_id", client.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Devis, factures, contrats et fichiers partagés avec Osiris Agency.
        </p>
      </div>
      <DocumentsTab
        clientId={client.id}
        documents={documents ?? []}
        documentRequests={documentRequests ?? []}
        viewerRole="client"
      />
    </div>
  );
}
