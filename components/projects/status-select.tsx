"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProjectStatus } from "@/app/(app)/projects/actions";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import type { Database } from "@/types/database.types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

export function StatusSelect({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      try {
        await updateProjectStatus(projectId, value as ProjectStatus);
        toast.success("Statut du projet mis à jour");
        router.refresh();
      } catch {
        toast.error("Impossible de changer le statut.");
      }
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROJECT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {PROJECT_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
