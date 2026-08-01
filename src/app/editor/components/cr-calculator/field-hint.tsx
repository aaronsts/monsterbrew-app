"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useCrComparison } from "./use-cr-comparison";
import { useCrSuggestionsEnabled } from "./use-cr-suggestions-enabled";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { AbilityKey, Classification } from "@/lib/cr-calculator";
import { cn, formatMod } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CLASSIFICATION_DISPLAY: Record<
  Classification,
  { icon: LucideIcon; text: string; className: string }
> = {
  high: {
    icon: TrendingUp,
    text: "High",
    className:
      "text-destructive-500 border border-destructive-300 bg-destructive-100 dark:text-destructive-900 dark:bg-destructive-300",
  },
  "on-par": {
    icon: Minus,
    text: "On par",
    className:
      "text-success-500 bg-success-100 border border-success-300 dark:text-success-900 dark:bg-success-300",
  },
  low: {
    icon: TrendingDown,
    text: "Low",
    className:
      "text-info-500 bg-info-100 border border-info-300 dark:text-info-900 dark:bg-info-300",
  },
};

/**
 * The shared chip: classification icon + text, wrapped in its own
 * `TooltipProvider` so hints stay drop-in for sections without one.
 */
function HintChip({
  classification,
  srText,
  tooltip,
}: Readonly<{
  classification: Classification;
  srText: string;
  tooltip: ReactNode;
}>) {
  const display = CLASSIFICATION_DISPLAY[classification];
  const Icon = display.icon;
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn(
                "flex w-fit items-center max-h-4 px-1 gap-1 text-[10px] font-normal",
                display.className,
              )}
            />
          }
        >
          <Icon aria-hidden className="size-3" />
          <span aria-hidden>{display.text}</span>
          <span className="sr-only">{srText}</span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const STAT_LABEL = { ac: "AC", hp: "HP" } as const;

/** Inline high/on-par/low badge for a stat field's label row. */
export function CrStatHint({ stat }: Readonly<{ stat: "ac" | "hp" }>) {
  const enabled = useCrSuggestionsEnabled();
  const comparison = useCrComparison();
  if (!enabled || !comparison) return null;

  const { actual, benchmark, classification } = comparison[stat];
  const target =
    stat === "hp"
      ? `${benchmark} (${comparison.benchmark.hpMin}–${comparison.benchmark.hpMax})`
      : `${benchmark}`;
  const text = CLASSIFICATION_DISPLAY[classification].text.toLowerCase();

  return (
    <HintChip
      classification={classification}
      srText={`${STAT_LABEL[stat]} ${text} for this challenge rating`}
      tooltip={
        <>
          {STAT_LABEL[stat]} {actual} vs {target} suggested for CR{" "}
          {comparison.benchmark.cr}
        </>
      }
    />
  );
}

/**
 * Badge for an ability-score field. Renders only on the creature's highest
 * ability — the one whose modifier projects the attack bonus and save DC —
 * comparing that modifier against what the CR benchmark implies.
 */
export function CrAbilityHint({ ability }: Readonly<{ ability: AbilityKey }>) {
  const enabled = useCrSuggestionsEnabled();
  const comparison = useCrComparison();
  if (!enabled || !comparison) return null;

  const {
    ability: bestAbility,
    actual,
    benchmark,
    classification,
  } = comparison.abilityModifier;
  if (ability !== bestAbility) return null;
  const text = CLASSIFICATION_DISPLAY[classification].text.toLowerCase();

  return (
    <HintChip
      classification={classification}
      srText={`${ability.toUpperCase()} modifier ${text} for this challenge rating`}
      tooltip={
        <>
          {ability.toUpperCase()} modifier {formatMod(actual)} vs{" "}
          {formatMod(benchmark)} suggested for CR {comparison.benchmark.cr};
          with the proficiency bonus it sets the attack bonus and save DC
        </>
      }
    />
  );
}
