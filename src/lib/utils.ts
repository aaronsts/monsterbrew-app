import { defaultCreature } from "@/schema/createCreatureSchema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface Option {
  label: string;
  value: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStatBonus(value: number | undefined) {
  if (!value) return 0;
  return Math.floor(value / 2) - 5 >= 0
    ? Math.floor(value / 2) - 5
    : Math.floor(value / 2) - 5;
}

export function calculateSavingThrow(
  score: Option,
  creature: typeof defaultCreature
) {
  const hasSavingThrow = creature.saving_throws.includes(
    score.label.toLowerCase()
  );
  return hasSavingThrow
    ? `+${
        calculateStatBonus(score.value) + (creature.cr.proficiency_bonus || 0)
      }`
    : calculateStatBonus(score.value) >= 0
    ? `+${calculateStatBonus(score.value)}`
    : `${calculateStatBonus(score.value)}`;
}

export function titleCase(str: string) {
  return str
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => " " + c.toUpperCase());
}
