"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DialogFormSkeleton } from "@/components/ui/dialog-form-skeleton";
import { useAutoOpen } from "@/lib/use-auto-open";

const NewQuoteDialogContent = dynamic(
  () => import("./new-quote-dialog-content").then((mod) => mod.NewQuoteDialogContent),
  { ssr: false, loading: () => <DialogFormSkeleton /> }
);

export function NewQuoteDialog({
  clients,
}: {
  clients: { id: string; company_name: string }[];
}) {
  const [open, setOpen] = useAutoOpen();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        }
      />
      {open && <NewQuoteDialogContent clients={clients} />}
    </Dialog>
  );
}
