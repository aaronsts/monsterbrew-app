import { defaultCreature, Languages } from "@/schema/createCreatureSchema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CREATURE_SIZES } from "./constants";

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
  creature: typeof defaultCreature,
) {
  const hasSavingThrow = creature.saving_throws.includes(
    score.label.toLowerCase(),
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

export function calculateHitPoints(
  amount: string,
  size: string,
  constitution?: number,
) {
  const foundSize = CREATURE_SIZES.find((s) => size === s.value);
  const hit_dice = foundSize?.hit_dice || 4;
  const modifier = calculateStatBonus(constitution);
  const extraHP = modifier * Number.parseInt(amount);
  const hp =
    Number.parseInt(amount) + Math.floor(hit_dice * Number.parseInt(amount));
  const medianHp = Math.floor(hp / 2 + extraHP);
  if (Number.isNaN(medianHp)) return "";

  return `${medianHp} (${Number.parseInt(amount)}d${hit_dice} + ${extraHP})`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const KNOWN_LANGUAGES = new Set<string>(Object.values(Languages));

/**
 * Splits a flat list of language strings into the known `Languages` enum
 * members and everything else.
 */
export function partitionLanguages(values: string[]): {
  languages: Languages[];
  custom_languages: string[];
} {
  const languages: Languages[] = [];
  const custom_languages: string[] = [];
  for (const value of values) {
    if (KNOWN_LANGUAGES.has(value)) {
      languages.push(value as Languages);
    } else {
      custom_languages.push(value);
    }
  }
  return { languages, custom_languages };
}
