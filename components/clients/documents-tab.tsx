"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Image as ImageIcon, File, Upload, Trash2, Download, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import {
  recordDocument,
  deleteDocument,
  getDocumentUrl,
} from "@/app/(app)/clients/documents-actions";
import type { Database } from "@/types/database.types";

type DocumentCategory = Database["public"]["Enums"]["document_category"];

type DocumentRow = {
  id: string;
  file_name: string;
  file_type: string | null;
  category: DocumentCategory;
  created_at: string;
  storage_path: string;
};

function categoryFromType(fileType: string): DocumentCategory {
  if (fileType.startsWith("image/")) return "image";
  if (fileType === "application/pdf") return "pdf";
  return "other";
}

function IconFor({ category }: { category: DocumentCategory }) {
  if (category === "image") return <ImageIcon className="h-4 w-4" />;
  if (category === "pdf") return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

export function DocumentsTab({
  clientId,
  documents,
}: {
  clientId: string;
  documents: DocumentRow[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const supabase = createClient();
    let successCount = 0;

    for (const file of Array.from(files)) {
      const path = `${clientId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("documents").upload(path, file);

      if (error) {
        toast.error(`Échec de l'upload de ${file.name}`);
        continue;
      }

      try {
        await recordDocument(
          clientId,
          path,
          file.name,
          file.type || "application/octet-stream",
          file.size,
          categoryFromType(file.type)
        );
        successCount += 1;
      } catch {
        toast.error(`Échec de l'enregistrement de ${file.name}`);
      }
    }

    if (successCount > 0) {
      toast.success(
        successCount > 1 ? `${successCount} documents ajoutés` : "Document ajouté"
      );
    }
    setUploading(false);
  }

  async function handleDownload(doc: DocumentRow) {
    const url = await getDocumentUrl(doc.storage_path);
    if (url) window.open(url, "_blank");
  }

  function handleDelete(doc: DocumentRow) {
    startTransition(async () => {
      await deleteDocument(clientId, doc.id, doc.storage_path);
      toast.success("Document supprimé");
    });
  }

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl transition-colors duration-(--duration-fast)",
        isDragOver && "outline-2 outline-dashed outline-primary/50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <Button
        variant="secondary"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Envoi..." : "Ajouter des documents"}
      </Button>

      {documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucun document"
          description="Glissez des fichiers ou utilisez le bouton ci-dessus pour les ajouter."
        />
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2">
                <IconFor category={doc.category} />
                <div>
                  <p className="text-sm font-medium">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
