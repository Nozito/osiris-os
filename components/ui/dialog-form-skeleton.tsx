import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/** Fallback for lazy-loaded dialog forms — avoids a blank flash while the chunk fetches. */
export function DialogFormSkeleton() {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <Skeleton className="h-5 w-32" />
      </DialogHeader>
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </DialogContent>
  );
}
