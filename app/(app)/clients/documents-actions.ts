"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type DocumentCategory = Database["public"]["Enums"]["document_category"];
// documents.visibility/stage/source are `text` + CHECK constraints (see
// 0013_invitations_and_documents.sql), not Postgres enums — codegen types
// them as plain `string`, so the literal unions are declared here instead.
type DocumentVisibility = "internal" | "client_visible";
type DocumentStage = "opening" | "ongoing" | "closing";
type DocumentSource = "agency" | "client";

function revalidateDossier(clientId: string) {
  revalidatePath(`/clients/${clientId}`);
  // Same DocumentsTab component is reused on the client portal side, which
  // has no dynamic client id in its URL (derived from the session instead).
  revalidatePath("/client/documents");
}

export async function recordDocument(
  clientId: string,
  storagePath: string,
  fileName: string,
  fileType: string,
  sizeBytes: number,
  category: DocumentCategory,
  options?: {
    visibility?: DocumentVisibility;
    stage?: DocumentStage;
    source?: DocumentSource;
    fulfillsRequestId?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: inserted, error } = await supabase
    .from("documents")
    .insert({
      client_id: clientId,
      uploaded_by: user?.id,
      storage_path: storagePath,
      file_name: fileName,
      file_type: fileType,
      size_bytes: sizeBytes,
      category,
      // RLS is the real enforcement here (documents_insert_own forces
      // source='client'/visibility='client_visible' for a client-owned
      // insert, documents_all_staff leaves staff unrestricted) — these are
      // just the values the caller intends, not the authorization boundary.
      visibility: options?.visibility ?? "client_visible",
      stage: options?.stage ?? null,
      source: options?.source ?? "agency",
    })
    .select("id")
    .single();

  if (error || !inserted) throw new Error("Impossible d'enregistrer le document.");

  if (options?.fulfillsRequestId) {
    await supabase
      .from("document_requests")
      .update({ status: "fulfilled", fulfilled_document_id: inserted.id })
      .eq("id", options.fulfillsRequestId);
  }

  revalidateDossier(clientId);
}

export async function deleteDocument(clientId: string, documentId: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("documents").remove([storagePath]);
  await supabase.from("documents").delete().eq("id", documentId);
  revalidateDossier(clientId);
}

export async function getDocumentUrl(storagePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 60 * 5);
  return data?.signedUrl ?? null;
}

/** Called by the client portal on first consultation of a document. */
export async function markDocumentViewed(documentId: string, clientId: string) {
  const supabase = await createClient();
  await supabase
    .from("documents")
    .update({ viewed_by_client_at: new Date().toISOString() })
    .eq("id", documentId)
    .is("viewed_by_client_at", null);
  revalidateDossier(clientId);
}

export async function createDocumentRequest(clientId: string, label: string, note?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("document_requests").insert({
    client_id: clientId,
    label,
    note: note || null,
    requested_by: user?.id,
  });

  if (error) throw new Error("Impossible de créer la demande de document.");
  revalidateDossier(clientId);
}

export async function cancelDocumentRequest(requestId: string, clientId: string) {
  const supabase = await createClient();
  await supabase.from("document_requests").update({ status: "cancelled" }).eq("id", requestId);
  revalidateDossier(clientId);
}
