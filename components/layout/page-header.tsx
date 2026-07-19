import { cn } from "@/lib/utils";

/**
 * The single owner of "what page is this" — there's no topbar breadcrumb
 * anymore, so `title` is the one source of truth for the page name (keep it
 * aligned with the sidebar rail's own labels, e.g. "Vue d'ensemble").
 */
export function PageHeader({
  title,
  description,
  meta,
  actions,
  tabs,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(title || description || meta || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            {title && (
              <h1 className="font-heading text-xl font-bold tracking-tight text-balance">
                {title}
              </h1>
            )}
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
