"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateInvoiceStatus, deleteInvoice } from "@/app/(app)/invoices/actions";
import type { Database } from "@/types/database.types";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      <Button
        variant="secondary"
        render={<a href={`/api/pdf/invoice/${invoiceId}`} target="_blank" />}
      >
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>

      {status === "created" && (
        <Button
          disabled={isPending}
          onClick={() => run(() => updateInvoiceStatus(invoiceId, "sent"), "Facture envoyée")}
        >
          Marquer envoyée
        </Button>
      )}
      {(status === "sent" || status === "overdue") && (
        <Button
          disabled={isPending}
          onClick={() => run(() => updateInvoiceStatus(invoiceId, "paid"), "Facture marquée payée")}
        >
          Marquer payée
        </Button>
      )}
      {status === "sent" && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => updateInvoiceStatus(invoiceId, "overdue"), "Facture marquée en retard")}
        >
          Marquer en retard
        </Button>
      )}
      {status !== "paid" && status !== "cancelled" && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => updateInvoiceStatus(invoiceId, "cancelled"), "Facture annulée")}
        >
          Annuler
        </Button>
      )}

      <Button
        variant="ghost"
        className="text-destructive"
        disabled={isPending}
        onClick={() =>
          run(async () => {
            await deleteInvoice(invoiceId);
            toast.success("Facture supprimée");
            router.push("/invoices");
          })
        }
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer
      </Button>
    </div>
  );
}
