import type { Monster } from "@/schema/monster-schema";
import { abilityScoresSchema } from "@/schema/monster-schema";
import { SKILLS } from "@/lib/skills";
import {
  calculateHitPoints,
  calculateStatBonus,
  capitalizeWords,
} from "@/lib/utils";

export const ABILITY_KEYS = abilityScoresSchema.keyof().options;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

const SKILL_ABILITY = new Map<string, string>(
  SKILLS.map((s) => [s.skill_name, s.skill_modifier]),
);
const SKILL_LABEL = new Map<string, string>(
  SKILLS.map((s) => [s.skill_name, s.label]),
);

export function skillLabel(name: string): string {
  return SKILL_LABEL.get(name) ?? capitalizeWords(name);
}

export function skillModifier(
  creature: Monster,
  name: string,
  level: "proficient" | "expert",
): number {
  const ability = (SKILL_ABILITY.get(name) ?? "dex") as AbilityKey;
  const pb = creature.cr.proficiency_bonus || 0;
  return (
    calculateStatBonus(creature.ability_scores[ability]) +
    (level === "expert" ? pb * 2 : pb)
  );
}

export function savingThrowModifier(
  creature: Monster,
  key: AbilityKey,
): number {
  return (
    calculateStatBonus(creature.ability_scores[key]) +
    (creature.cr.proficiency_bonus || 0)
  );
}

export function hitPoints(creature: Monster): {
  text: string;
  value: number;
  /** Dice notation without the surrounding parentheses, e.g. `19d12 + 133`. */
  formula: string;
} {
  const text = creature.custom_hp
    ? creature.hit_points
    : calculateHitPoints(
        creature.hit_dice,
        creature.size,
        creature.ability_scores.con,
      ) || creature.hit_points;

  return {
    text,
    value: Number.parseInt(text, 10) || 0,
    formula: /\(([^)]+)\)/.exec(text)?.[1].trim() ?? "",
  };
}

/** Initiative modifier: the authored override, or the DEX modifier. */
export function initiativeModifier(creature: Monster): number {
  return creature.custom_initiative
    ? Number(creature.initiative_bonus) || 0
    : calculateStatBonus(creature.ability_scores.dex);
}

export const NONMAGICAL_PHRASES: Record<string, string> = {
  nonmagical: "bludgeoning, piercing, and slashing from nonmagical attacks",
  silvered: "bludgeoning, piercing, and slashing from nonsilvered attacks",
};
