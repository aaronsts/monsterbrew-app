import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({ label }: Readonly<{ label: string }>) {
  return (
    <output aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-2" aria-hidden="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: 4 }, (_, row) => (
          <Skeleton key={row} className="h-24 w-full" />
        ))}
      </div>
    </output>
  );
}
