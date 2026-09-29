import { cn } from "@projectx/utils";

export function Skeleton({ className }: { className?: string }) {
  // The default radius steps aside when the caller names one (class order in the stylesheet would decide otherwise).
  return <div className={cn("skeleton", !className?.includes("rounded-") && "rounded-sm", className)} />;
}

/** Generic card-list skeleton for list pages. */
export function ListSkeleton({ rows = 4, withAvatar = true }: { rows?: number; withAvatar?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg shadow-sm border border-neutral-200/70 p-5 flex gap-4">
          {withAvatar && <Skeleton className="h-12 w-12 rounded-pill shrink-0" />}
          <div className="flex-1 flex flex-col gap-2.5 py-0.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <ListSkeleton rows={3} />
    </div>
  );
}
