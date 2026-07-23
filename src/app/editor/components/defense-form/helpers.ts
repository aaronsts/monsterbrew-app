import type { Monster } from "@/schema/monster-schema";
import { ABILITY_LABELS, ABILITY_SCORES } from "@/lib/abilities";
import { SKILLS } from "@/lib/skills";

export type SkillProficiency = "proficient" | "expert" | "";
export type DamageState = "resistant" | "vulnerable" | "immune" | "";
export type NonmagicalState = "resistant" | "immune" | "";

export const NONMAGICAL_ATTACK_TYPES = [
  { key: "nonmagical", label: "Nonmagical attacks" },
  { key: "silvered", label: "Nonsilvered attacks" },
] as const;

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
      return "border-red-400/50 bg-red-400/10 text-red-400 hover:bg-red-400/20 hover:text-red-400";
    case "resistant":
      return "border-amber-400/50 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 hover:text-amber-400";
    case "immune":
      return "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500";
    default:
      return "border-input text-muted-foreground hover:bg-muted";
  }
}

// Our custom focus-visible treatment, matching the Button component.
export const FOCUS_RING =
  "outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";
