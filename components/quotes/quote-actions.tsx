"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Copy, Trash2, ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  updateQuoteStatus,
  duplicateQuote,
  deleteQuote,
  convertQuoteToInvoice,
} from "@/app/(app)/quotes/actions";
import type { Database } from "@/types/database.types";

type QuoteStatus = Database["public"]["Enums"]["quote_status"];

const NEXT_STATUS: Partial<Record<QuoteStatus, { status: QuoteStatus; label: string }>> = {
  draft: { status: "sent", label: "Marquer envoyé" },
  sent: { status: "viewed", label: "Marquer vu" },
  viewed: { status: "accepted", label: "Marquer accepté" },
};

export function QuoteActions({
  quoteId,
  status,
  canDelete,
}: {
  quoteId: string;
  status: QuoteStatus;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const next = NEXT_STATUS[status];
  const deleteConfirm = useConfirmDialog();

  function run(action: () => Promise<unknown>, successMessage?: string) {
    startTransition(async () => {
      try {
        await action();
        if (successMessage) toast.success(successMessage);
        router.refresh();
      } catch {
        toast.error("Une erreur est survenue.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" render={<a href={`/api/pdf/quote/${quoteId}`} target="_blank" />}>
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>

      {next && (
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => updateQuoteStatus(quoteId, next.status), "Statut mis à jour")
          }
        >
          {next.label}
        </Button>
      )}

      {status !== "refused" && status !== "converted" && status !== "draft" && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            run(() => updateQuoteStatus(quoteId, "refused"), "Devis marqué refusé")
          }
        >
          Marquer refusé
        </Button>
      )}

      {status === "accepted" && (
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            run(async () => {
              const invoiceId = await convertQuoteToInvoice(quoteId);
              toast.success("Facture créée");
              router.push(`/invoices/${invoiceId}`);
            })
          }
        >
          <ArrowRightCircle className="mr-2 h-4 w-4" />
          Convertir en facture
        </Button>
      )}

      <Button
        variant="ghost"
        disabled={isPending}
        onClick={() =>
          run(async () => {
            const newId = await duplicateQuote(quoteId);
            toast.success("Devis dupliqué");
            router.push(`/quotes/${newId}`);
          })
        }
      >
        <Copy className="mr-2 h-4 w-4" />
        Dupliquer
      </Button>

      {canDelete && (
        <>
          <Button
            variant="ghost"
            className="text-destructive"
            disabled={isPending}
            onClick={deleteConfirm.requestConfirm}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <ConfirmDialog
            open={deleteConfirm.open}
            onOpenChange={deleteConfirm.setOpen}
            title="Supprimer ce devis ?"
            description="Cette action est définitive et ne peut pas être annulée."
            confirmLabel="Supprimer"
            pending={isPending}
            onConfirm={() => {
              deleteConfirm.setOpen(false);
              run(async () => {
                await deleteQuote(quoteId);
                toast.success("Devis supprimé");
                router.push("/quotes");
              });
            }}
          />
        </>
      )}
    </div>
  );
}
