import { Skeleton } from "@/components/ui/skeleton";

export function CreatureDetailSkeleton() {
  return (
    <output aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Loading the creature…</span>

      <div
        className="flex flex-wrap items-center justify-between gap-3"
        data-testid="creature-detail-skeleton-actions"
        aria-hidden="true"
      >
        <Skeleton className="h-8 w-36" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </div>

      <Skeleton
        className="h-[32rem] w-full"
        data-testid="creature-detail-skeleton-statblock"
        aria-hidden="true"
      />
    </output>
  );
}
