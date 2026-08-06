"use client";

import { ChevronDownIcon } from "lucide-react";
import { Suspense, lazy } from "react";
import { useCrComparison } from "./use-cr-comparison";
import type { CrComparison, StatComparison } from "@/lib/cr-calculator";
import type { DeltaBarDatum } from "@/components/delta-bar-chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown when the chart's chunk can't be fetched — most likely a deploy having
 * rotated the hashed assets under a long-lived editor tab.
 *
 * This has to be handled here rather than left to throw: there is no error
 * boundary between this component and the router's, so a rejected `import()`
 * would unmount `MonsterForm` and take an unsaved creature with it. The
 * screen-reader summary below the panel still carries the same numbers.
 */
function ChartUnavailable() {
  return (
    <p className="py-2 text-xs text-muted-foreground">
      The benchmark chart couldn&apos;t be loaded. Reload the page to try again.
    </p>
  );
}

const DeltaChartBody = lazy(() =>
  import("./delta-chart-body").catch(() => ({ default: ChartUnavailable })),
);

const DELTA_STATS = [
  { key: "attackBonus", label: "Atk. bonus" },
  { key: "ac", label: "Armor class" },
  { key: "dc", label: "Save DC" },
  { key: "hp", label: "Hit points" },
] as const;

const DAMAGE_LABEL = "Dmg/round";

/**
 * The charted stats: the four that always resolve, plus damage per round
 * whenever the creature's features carry readable damage tags.
 */
function chartedStats(
  comparison: CrComparison,
): Array<{ label: string; stat: StatComparison }> {
  const stats: Array<{ label: string; stat: StatComparison }> = DELTA_STATS.map(
    ({ key, label }) => ({ label, stat: comparison[key] }),
  );
  if (comparison.damagePerRound) {
    stats.push({ label: DAMAGE_LABEL, stat: comparison.damagePerRound });
  }
  return stats;
}

/**
 * Each stat's signed distance from the benchmark in tolerance units — 1.0 is
 * the edge of on-par (raw deltas like +2 AC and -40 HP can't share one axis).
 * Clamped to ±3 so one extreme stat can't flatten the rest of the chart.
 */
export function deltaChartData(comparison: CrComparison): Array<DeltaBarDatum> {
  return chartedStats(comparison).map(({ label, stat }) => {
    const { actual, benchmark, tolerance } = stat;
    const raw = tolerance > 0 ? (actual - benchmark) / tolerance : 0;
    return { stat: label, delta: Math.max(-3, Math.min(3, raw)) };
  });
}

function describeDeltas(comparison: CrComparison): string {
  return chartedStats(comparison)
    .map(({ label, stat }) => {
      const { classification } = stat;
      return `${label}: ${classification === "on-par" ? "on par" : classification}.`;
    })
    .join(" ");
}

export function DeltaChart() {
  const comparison = useCrComparison();
  if (!comparison) return null;

  return (
    <Collapsible>
      <CollapsibleTrigger className="group/delta-trigger flex w-full items-center justify-between gap-2 py-1 text-left text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring/50">
        Benchmark deltas
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/delta-trigger:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
        {/* The collapsible measures its panel exactly once as it opens, with no
            ResizeObserver, so whatever the fallback stands at is the height the
            animation targets — and with `overflow-hidden` above, anything the
            real content adds beyond it is clipped until the transition ends.
            So reserve the legend's line as well as the chart's box. */}
        <Suspense
          fallback={
            <div aria-hidden>
              <Skeleton className="aspect-square w-full sm:aspect-5/2 lg:aspect-4/1" />
              <Skeleton className="mt-1 h-3 w-2/3" />
            </div>
          }
        >
          <DeltaChartBody data={deltaChartData(comparison)} />
        </Suspense>
        <p className="sr-only">{describeDeltas(comparison)}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
