"use client";

import { useRef, useState, useTransition } from "react";
import {
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  Trash2,
  Download,
  FolderOpen,
  Lock,
  Eye,
  ClipboardList,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import {
  recordDocument,
  deleteDocument,
  getDocumentUrl,
  markDocumentViewed,
  createDocumentRequest,
  cancelDocumentRequest,
} from "@/app/(app)/clients/documents-actions";
import type { Database } from "@/types/database.types";

type DocumentCategory = Database["public"]["Enums"]["document_category"];
type DocumentVisibility = "internal" | "client_visible";
type DocumentStage = "opening" | "ongoing" | "closing";

type DocumentRow = {
  id: string;
  file_name: string;
  file_type: string | null;
  category: DocumentCategory;
  created_at: string;
  storage_path: string;
  visibility?: string;
  stage?: string | null;
  source?: string;
  viewed_by_client_at?: string | null;
};

type DocumentRequestRow = {
  id: string;
  label: string;
  note: string | null;
  status: string;
  created_at: string;
};

const STAGE_LABELS: Record<DocumentStage, string> = {
  opening: "Ouverture",
  ongoing: "Suivi",
  closing: "Clôture",
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
  documentRequests = [],
  viewerRole = "staff",
}: {
  clientId: string;
  documents: DocumentRow[];
  documentRequests?: DocumentRequestRow[];
  viewerRole?: "staff" | "client";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fulfillInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadVisibility, setUploadVisibility] = useState<DocumentVisibility>("client_visible");
  const [uploadStage, setUploadStage] = useState<DocumentStage | "none">("none");
  const [fulfillingRequestId, setFulfillingRequestId] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestPending, startRequestTransition] = useTransition();
  const [docToDelete, setDocToDelete] = useState<DocumentRow | null>(null);

  const isStaff = viewerRole === "staff";
  const pendingRequests = documentRequests.filter((r) => r.status === "pending");

  async function handleFiles(files: FileList, fulfillsRequestId?: string) {
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
          categoryFromType(file.type),
          isStaff
            ? {
                visibility: uploadVisibility,
                stage: uploadStage === "none" ? undefined : uploadStage,
                source: "agency",
              }
            : { source: "client", visibility: "client_visible", fulfillsRequestId }
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
    setFulfillingRequestId(null);
  }

  async function handleDownload(doc: DocumentRow) {
    const url = await getDocumentUrl(doc.storage_path);
    if (url) window.open(url, "_blank");
    if (!isStaff && !doc.viewed_by_client_at) {
      markDocumentViewed(doc.id, clientId);
    }
  }

  function handleDelete(doc: DocumentRow) {
    setDocToDelete(null);
    startTransition(async () => {
      try {
        await deleteDocument(clientId, doc.id, doc.storage_path);
        toast.success("Document supprimé");
      } catch {
        toast.error("Échec de la suppression du document.");
      }
    });
  }

  function handleCreateRequest(formData: FormData) {
    const label = String(formData.get("label") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();
    if (!label) return;
    startRequestTransition(async () => {
      try {
        await createDocumentRequest(clientId, label, note || undefined);
        toast.success("Document demandé au client.");
        setRequestOpen(false);
      } catch {
        toast.error("Impossible de créer la demande.");
      }
    });
  }

  function handleCancelRequest(requestId: string) {
    startRequestTransition(async () => {
      await cancelDocumentRequest(requestId, clientId);
      toast.success("Demande annulée.");
    });
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <p className="section-title text-muted-foreground">
            {isStaff ? "Documents demandés au client" : "Documents à fournir"}
          </p>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{req.label}</p>
                  {req.note && (
                    <p className="truncate text-xs text-muted-foreground">{req.note}</p>
                  )}
                </div>
                {isStaff ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={requestPending}
                    onClick={() => handleCancelRequest(req.id)}
                    title="Annuler la demande"
                    aria-label={`Annuler la demande "${req.label}"`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={uploading}
                    onClick={() => {
                      setFulfillingRequestId(req.id);
                      fulfillInputRef.current?.click();
                    }}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Fournir
                  </Button>
                )}
              </div>
            ))}
          </div>
          <input
            ref={fulfillInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && fulfillingRequestId) {
                handleFiles(e.target.files, fulfillingRequestId);
              }
            }}
          />
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Envoi..." : "Ajouter des documents"}
          </Button>

          {isStaff && (
            <>
              <Select
                value={uploadVisibility}
                onValueChange={(v) => v && setUploadVisibility(v as DocumentVisibility)}
              >
                <SelectTrigger size="sm" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_visible">Visible client</SelectItem>
                  <SelectItem value="internal">Interne uniquement</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={uploadStage}
                onValueChange={(v) => v && setUploadStage(v as DocumentStage | "none")}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Étape —</SelectItem>
                  <SelectItem value="opening">Ouverture</SelectItem>
                  <SelectItem value="ongoing">Suivi</SelectItem>
                  <SelectItem value="closing">Clôture</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogTrigger render={<Button variant="ghost" size="sm" />}>
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                  Demander un document
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Demander un document au client</DialogTitle>
                  </DialogHeader>
                  <form action={handleCreateRequest} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="label">Document attendu</Label>
                      <Input id="label" name="label" required placeholder="Ex. Kbis, logo HD..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="note">Note (optionnel)</Label>
                      <Input id="note" name="note" />
                    </div>
                    <div className="flex gap-2">
                      <DialogClose render={<Button type="button" variant="outline" className="flex-1" />}>
                        Annuler
                      </DialogClose>
                      <Button type="submit" className="flex-1" disabled={requestPending}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Demander
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

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
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IconFor category={doc.category} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.file_name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                      </p>
                      {doc.stage && (
                        <Badge variant="secondary" className="text-[10px]">
                          {STAGE_LABELS[doc.stage as DocumentStage] ?? doc.stage}
                        </Badge>
                      )}
                      {isStaff && doc.visibility === "internal" && (
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <Lock className="h-2.5 w-2.5" />
                          Interne
                        </Badge>
                      )}
                      {isStaff && doc.source === "client" && (
                        <Badge variant="outline" className="text-[10px]">
                          Fourni par le client
                        </Badge>
                      )}
                      {isStaff && doc.viewed_by_client_at && (
                        <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                          <Eye className="h-2.5 w-2.5" />
                          Vu le {new Date(doc.viewed_by_client_at).toLocaleDateString("fr-FR")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    aria-label={`Télécharger ${doc.file_name}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isStaff && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => setDocToDelete(doc)}
                      aria-label={`Supprimer ${doc.file_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={docToDelete !== null}
        onOpenChange={(open) => !open && setDocToDelete(null)}
        title="Supprimer ce document ?"
        description={
          docToDelete
            ? `« ${docToDelete.file_name} » sera définitivement supprimé.`
            : undefined
        }
        confirmLabel="Supprimer"
        pending={isPending}
        onConfirm={() => docToDelete && handleDelete(docToDelete)}
      />
    </div>
  );
}
