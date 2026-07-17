import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-white/[0.01] px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground/90">{title}</p>
        {description && (
          <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
