import { cn } from "@/lib/utils";

/**
 * Replaces the old `page-title`/`page-subtitle` block. The topbar (see
 * app-topbar.tsx) already renders the page title as a breadcrumb, so this
 * component intentionally never repeats it — it only carries the
 * description, inline stats, tabs and actions that make each page distinct.
 */
export function PageHeader({
  description,
  meta,
  actions,
  tabs,
  className,
}: {
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(description || meta || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            {description && (
              <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
            )}
            {meta && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                {meta}
              </div>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {tabs}
    </div>
  );
}

export function StatRow({
  items,
  className,
}: {
  items: {
    label: string;
    value: React.ReactNode;
    tone?: "default" | "primary";
  }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch divide-x divide-border overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-[7.5rem] flex-1 px-4 py-3.5">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              "stat-value mt-1.5 text-xl leading-none",
              item.tone === "primary" && "text-primary"
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
