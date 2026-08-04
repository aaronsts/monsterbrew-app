import { useFormContext, useWatch } from "react-hook-form";
import type { CrComparison } from "@/lib/cr-calculator";
import type { Monster } from "@/schema/monster-schema";
import { compareToCr } from "@/lib/cr-calculator";

/**
 * Live `CrComparison` for the creature being edited — the single source every
 * CR-calculator component (chart, dialog, field hints) reads from. `null`
 * while the selected CR has no benchmark row (empty or custom CR).
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
}
