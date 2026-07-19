import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Event = { id: string; label: string; date: string; href: string; tone: "default" | "success" };

export function ActivityFeed({ events }: { events: Event[] }) {
  return (
    <Card>
      <CardHeader>
        <p className="section-title">Activité récente</p>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Pas encore d'activité"
            description="Les leads créés, devis signés, factures payées et changements de statut projet apparaîtront ici au fil de l'eau."
            className="border-none bg-transparent py-4"
          />
        ) : (
          <div className="space-y-0">
            {events.map((event) => (
              <Link
                key={event.id}
                href={event.href}
                className="flex items-center gap-3 py-2 transition-colors duration-(--duration-fast) hover:text-primary"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    event.tone === "success" ? "bg-[var(--success)]" : "bg-white/25"
                  )}
                />
                <p className="min-w-0 flex-1 truncate text-sm">{event.label}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: fr })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
