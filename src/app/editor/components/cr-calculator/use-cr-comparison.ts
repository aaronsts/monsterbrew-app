import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { CrComparison } from "@/lib/cr-calculator";
import type { Monster } from "@/schema/monster-schema";
import { compareToCr } from "@/lib/cr-calculator";

/**
 * Live `CrComparison` for the creature being edited — the single source every
 * CR-calculator component (chart, dialog, field hints) reads from. `null`
 * while the selected CR has no benchmark row (empty or custom CR).
 *
 * Memoized mainly for a stable object identity: the hook is mounted about a
 * dozen times over the form (one hint per ability score alone), and now that it
 * watches the feature arrays, every one of them re-renders on each keystroke in
 * an action description. The comparison itself is cheap — a few hundredths of a
 * millisecond even for a Kraken — but handing `DeltaChart` the same object back
 * keeps recharts from redrawing when nothing it plots has moved.
 */
export function useCrComparison(): CrComparison | null {
  const { control } = useFormContext<Monster>();
  const [
    cr,
    armor_class,
    hit_points,
    hit_dice,
    size,
    custom_hp,
    ability_scores,
    name,
    traits,
    actions,
    bonus_actions,
    reactions,
    is_legendary,
    legendary_actions,
  ] = useWatch({
    control,
    name: [
      "cr",
      "armor_class",
      "hit_points",
      "hit_dice",
      "size",
      "custom_hp",
      "ability_scores",
      "name",
      "traits",
      "actions",
      "bonus_actions",
      "reactions",
      "is_legendary",
      "legendary_actions",
    ],
  });

  return useMemo(() => {
    if (!cr || !ability_scores) return null;
    return compareToCr({
      cr,
      armor_class,
      hit_points,
      hit_dice,
      size,
      custom_hp,
      ability_scores,
      name,
      traits: traits ?? [],
      actions: actions ?? [],
      bonus_actions: bonus_actions ?? [],
      reactions: reactions ?? [],
      is_legendary,
      legendary_actions: legendary_actions ?? [],
    });
  }, [
    cr,
    armor_class,
    hit_points,
    hit_dice,
    size,
    custom_hp,
    ability_scores,
    name,
    traits,
    actions,
    bonus_actions,
    reactions,
    is_legendary,
    legendary_actions,
  ]);
}
