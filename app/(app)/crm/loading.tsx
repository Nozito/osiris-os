import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl border border-border bg-white/[0.015] p-2"
          >
            <div className="flex items-center justify-between px-1 py-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-5 rounded-full" />
            </div>
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
