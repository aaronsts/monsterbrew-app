import type { z } from "zod";
import { abilityScoresSchema } from "@/schema/monster-schema";

export type AbilityKey = keyof z.infer<typeof abilityScoresSchema>;

export const ABILITY_SCORES = abilityScoresSchema.keyof()._def
  .values as Array<AbilityKey>;

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

/** The ability keys as `{ value, label }` pairs for option-style controls. */
export const ABILITY_OPTIONS = ABILITY_SCORES.map((ability) => ({
  value: ability,
  label: ABILITY_LABELS[ability],
}));
