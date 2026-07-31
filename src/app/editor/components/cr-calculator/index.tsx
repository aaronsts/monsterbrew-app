"use client";

import { DeltaChart } from "./delta-chart";
import { RecommendedStatsDialog } from "./recommended-stats-dialog";
import { useCrComparison } from "./use-cr-comparison";
import { useCrSuggestionsEnabled } from "./use-cr-suggestions-enabled";

export function CrCalculator() {
  const enabled = useCrSuggestionsEnabled();
  const comparison = useCrComparison();
  if (!enabled) return null;

  return (
    <section className="flex flex-col gap-2 border border-primary-100 dark:border-primary-500 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">CR benchmarks</p>
        <RecommendedStatsDialog />
      </div>
      {comparison ? (
        <DeltaChart />
      ) : (
        <p className="text-xs text-muted-foreground">
          Pick a challenge rating to compare this creature against its
          benchmarks.
        </p>
      )}
    </section>
  );
}
