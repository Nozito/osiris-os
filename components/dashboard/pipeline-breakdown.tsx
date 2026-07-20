import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

type Stage = { status: string; label: string; count: number; ratio: number };

export function PipelineBreakdown({ stages }: { stages: Stage[] }) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <p className="section-title">Pipeline commercial</p>
        <p className="text-xs text-muted-foreground">{total} lead{total > 1 ? "s" : ""} actif{total > 1 ? "s" : ""}</p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState
            icon={Users}
            title="Pipeline vide"
            description="Les leads actifs apparaîtront ici, répartis par étape."
            action={
              <Link href="/crm?new=1" className="text-xs text-primary hover:underline">
                Ajouter un lead
              </Link>
            }
            className="border-none bg-transparent py-4"
          />
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => (
              <Link
                key={stage.status}
                href="/crm"
                className="-mx-(--card-spacing) block space-y-1.5 rounded-md px-(--card-spacing) py-1.5 transition-colors duration-(--duration-fast) hover:bg-white/[0.03] active:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/85">{stage.label}</span>
                  <span className="tabular-nums text-muted-foreground">{stage.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(stage.ratio * 100, stage.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
