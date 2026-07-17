import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import type { Database } from "@/types/database.types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

export function StatusTimeline({
  history,
}: {
  history: { id: string; to_status: ProjectStatus; created_at: string; note: string | null }[];
}) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun historique.</p>;
  }

  return (
    <ol className="space-y-4">
      {history.map((entry, i) => (
        <li key={entry.id} className="relative flex gap-3 pl-1">
          <div className="flex flex-col items-center">
            <span
              className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`}
            />
            {i < history.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium">{PROJECT_STATUS_LABELS[entry.to_status]}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(entry.created_at).toLocaleString("fr-FR")}
            </p>
            {entry.note && <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
