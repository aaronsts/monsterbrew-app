import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for the editor while the client takes over.
 */
export function EditorSkeleton() {
  return (
    <output
      aria-busy="true"
      className="flex flex-col gap-4"
      data-testid="editor-skeleton"
    >
      <span className="sr-only">Loading the editor…</span>

      {/* Action bar: CR suggestions toggle, Import, Save. */}
      <div className="flex items-center justify-end gap-2 py-2">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-18" />
      </div>

      {/* CR benchmarks strip. */}
      <Skeleton className="h-20 mt-2 mb-1 w-full" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="flex flex-col gap-6"
          data-testid="editor-skeleton-form"
          aria-hidden="true"
        >
          {/* Identity, Combat, Defense, Actions — collapsible section headers. */}
          {["identity", "combat", "defense", "actions"].map((section) => (
            <div key={section} className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <div className="flex flex-col gap-2 px-1">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        <div
          className="lg:sticky lg:top-30 lg:h-fit"
          data-testid="editor-skeleton-preview"
          aria-hidden="true"
        >
          <Skeleton className="h-128 w-full" />
        </div>
      </div>
    </output>
  );
}
