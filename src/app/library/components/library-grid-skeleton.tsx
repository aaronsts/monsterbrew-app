import { Skeleton } from "@/components/ui/skeleton";

export function LibraryGridSkeleton() {
  return (
    <output aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Loading your library…</span>

      <div
        className="flex flex-wrap items-start justify-between gap-4"
        data-testid="library-skeleton-header"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-12" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-40" />
      </div>

      {/* "My creatures" / "SRD monsters" toggle. */}
      <Skeleton className="h-8 w-64" aria-hidden="true" />

      <Skeleton
        className="h-24 w-full"
        data-testid="library-skeleton-filters"
        aria-hidden="true"
      />

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="library-skeleton-grid"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, card) => (
          <Skeleton key={card} className="h-48 w-full" />
        ))}
      </div>
    </output>
  );
}
