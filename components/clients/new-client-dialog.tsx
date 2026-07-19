"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DialogFormSkeleton } from "@/components/ui/dialog-form-skeleton";
import { useAutoOpen } from "@/lib/use-auto-open";

const NewClientDialogContent = dynamic(
  () => import("./new-client-dialog-content").then((mod) => mod.NewClientDialogContent),
  { ssr: false, loading: () => <DialogFormSkeleton /> }
);

export function NewClientDialog() {
  const [open, setOpen] = useAutoOpen();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        }
      />
      {open && <NewClientDialogContent />}
    </Dialog>
  );
}
