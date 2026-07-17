"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type DocumentCategory = Database["public"]["Enums"]["document_category"];

export async function recordDocument(
  clientId: string,
  storagePath: string,
  fileName: string,
  fileType: string,
  sizeBytes: number,
  category: DocumentCategory
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("documents").insert({
    client_id: clientId,
    uploaded_by: user?.id,
    storage_path: storagePath,
    file_name: fileName,
    file_type: fileType,
    size_bytes: sizeBytes,
    category,
  });

  if (error) throw new Error("Impossible d'enregistrer le document.");

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteDocument(clientId: string, documentId: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("documents").remove([storagePath]);
  await supabase.from("documents").delete().eq("id", documentId);
  revalidatePath(`/clients/${clientId}`);
}

export async function getDocumentUrl(storagePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 60 * 5);
  return data?.signedUrl ?? null;
}
