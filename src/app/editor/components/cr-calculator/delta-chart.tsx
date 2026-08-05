"use client";

import { ChevronDownIcon } from "lucide-react";
import { useCrComparison } from "./use-cr-comparison";
import type { CrComparison, StatComparison } from "@/lib/cr-calculator";
import type { DeltaBarDatum } from "@/components/delta-bar-chart";
import { DeltaBarChart, DeltaBarLegend } from "@/components/delta-bar-chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
        <DeltaBarChart
          data={deltaChartData(comparison)}
          max={3}
          showBand
          className="lg:aspect-4/1"
        />
        <DeltaBarLegend baselineLabel="CR benchmark; within ±1 counts as on par" />
        <p className="sr-only">{describeDeltas(comparison)}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
