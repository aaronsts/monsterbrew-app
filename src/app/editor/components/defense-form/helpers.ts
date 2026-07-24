import type { z } from "zod";
import type { Monster } from "@/schema/monster-schema";
import { SKILLS } from "@/lib/skills";
import { abilityScoresSchema } from "@/schema/monster-schema";

export type AbilityKey = keyof z.infer<typeof abilityScoresSchema>;
export const ABILITY_SCORES = abilityScoresSchema.keyof()._def
  .values as Array<AbilityKey>;

export type SkillProficiency = "proficient" | "expert" | "";
export type DamageState = "resistant" | "vulnerable" | "immune" | "";
export type NonmagicalState = "resistant" | "immune" | "";

export const NONMAGICAL_ATTACK_TYPES = [
  { key: "nonmagical", label: "Nonmagical attacks" },
  { key: "silvered", label: "Nonsilvered attacks" },
] as const;

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

export const SKILLS_BY_ABILITY = ABILITY_SCORES.map((ability) => ({
  ability,
  label: ABILITY_LABELS[ability],
  skills: SKILLS.filter((skill) => skill.skill_modifier === ability),
})).filter((group) => group.skills.length > 0);

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function nextSkillState(state: SkillProficiency): SkillProficiency {
  return state === "" ? "proficient" : state === "proficient" ? "expert" : "";
}

export function nextDamageState(state: DamageState): DamageState {
  return state === ""
    ? "resistant"
    : state === "resistant"
      ? "vulnerable"
      : state === "vulnerable"
        ? "immune"
        : "";
}

export function setSkill(
  current: NonNullable<Monster["skills"]>,
  name: string,
  next: SkillProficiency,
): Monster["skills"] {
  const updated = { ...current };
  if (next === "") {
    delete updated[name];
  } else {
    updated[name] = next;
  }
  return updated;
}

export function setDamage(
  current: NonNullable<Monster["damage_modifiers"]>,
  name: string,
  next: DamageState,
): Monster["damage_modifiers"] {
  const updated = { ...current };
  if (next === "") {
    delete updated[name];
  } else {
    updated[name] = next;
  }
  return updated;
}

export function nextNonmagicalState(state: NonmagicalState): NonmagicalState {
  return state === "" ? "resistant" : state === "resistant" ? "immune" : "";
}

export function setNonmagical(
  current: NonNullable<Monster["nonmagical_attack_modifiers"]>,
  name: string,
  next: NonmagicalState,
): Monster["nonmagical_attack_modifiers"] {
  const updated = { ...current };
  if (next === "") {
    delete updated[name];
  } else {
    updated[name] = next;
  }
  return updated;
}

export function damageStateStyles(state: DamageState): string {
  switch (state) {
    case "vulnerable":
      return "border-destructive-300 bg-destructive-100 text-destructive-500 hover:bg-destructive-300 hover:text-destructive-700";
    case "resistant":
      return "border-warning-300 bg-warning-100 text-warning-500 hover:bg-warning-300 hover:text-warning-700";
    case "immune":
      return "border-success-300 bg-success-100 text-success-500 hover:bg-success-300 hover:text-success-700";
    default:
      return "border-input text-muted-foreground hover:bg-muted";
  }
}

// Our custom focus-visible treatment, matching the Button component.
export const FOCUS_RING =
  "outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";
