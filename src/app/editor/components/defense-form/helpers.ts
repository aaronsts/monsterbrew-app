import { ShieldAlert, ShieldCheck, ShieldHalf } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

export const DAMAGE_STATE_ICONS: Record<
  Exclude<DamageState, "">,
  LucideIcon
> = {
  resistant: ShieldHalf,
  vulnerable: ShieldAlert,
  immune: ShieldCheck,
};

export function damageStateStyles(state: DamageState): string {
  switch (state) {
    case "vulnerable":
      return "border-destructive-500 bg-destructive-500 dark:bg-destructive-700 dark:text-destructive-100 dark:border-destructive-700 dark:hover:bg-destructive-500 text-destructive-100 hover:bg-destructive-300 ";
    case "resistant":
      return "border-warning-500 bg-warning-500 text-warning-100 hover:bg-warning-300  dark:border-warning-700 dark:bg-warning-700 dark:text-warning-100 dark:hover:bg-warning-500";
    case "immune":
      return "border-success-500 bg-success-500 text-success-100 hover:bg-success-300  dark:border-success-700 dark:bg-success-700 dark:text-success-100 dark:hover:bg-success-500";
    default:
      return "border-input text-muted-foreground hover:bg-muted";
  }
}

// Our custom focus-visible treatment, matching the Button component.
export const FOCUS_RING =
  "outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";
