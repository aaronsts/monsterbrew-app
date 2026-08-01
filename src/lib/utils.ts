import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CREATURE_SIZES } from "./constants";
import type { ClassValue } from "clsx";
import type { KeyboardEvent } from "react";
import type { defaultCreature } from "@/schema/createCreatureSchema";
import { Languages } from "@/schema/createCreatureSchema";

interface Option {
  label: string;
  value: number;
}

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function blockMinusKey(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === "-") e.preventDefault();
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

/** Signed modifier text: 3 → "+3", 0 → "+0", -2 → "-2". */
export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function titleCase(str: string) {
  return str
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => " " + c.toUpperCase());
}

export function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

const MOVEMENT_KEYS = ["walk", "swim", "burrow", "climb", "fly"] as const;

/**
 * Speed-line entries for a statblock, e.g. `["30 ft.", "Fly 60 ft. (hover)"]`.
 * `hover` is a flag on the fly speed, not a movement mode of its own.
 */
export function formatMovements(
  movements: Partial<Record<(typeof MOVEMENT_KEYS)[number], number>> & {
    hover?: boolean;
  },
): Array<string> {
  return MOVEMENT_KEYS.flatMap((key) => {
    const value = movements[key];
    if (!value) return [];
    if (key === "walk") return [`${value} ft.`];
    const hover = key === "fly" && movements.hover ? " (hover)" : "";
    return [`${titleCase(key)} ${value} ft.${hover}`];
  });
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

  const bonus =
    extraHP === 0 ? "" : extraHP > 0 ? ` + ${extraHP}` : ` - ${-extraHP}`;
  return `${medianHp} (${Number.parseInt(amount)}d${hit_dice}${bonus})`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Trailing-edge debounce: `fn` runs `wait` ms after the last call. The returned
 * function carries a `cancel()` to drop a pending invocation (e.g. on unmount).
 */
export function debounce<TArgs extends Array<unknown>>(
  fn: (...args: TArgs) => void,
  wait: number,
): ((...args: TArgs) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}

const KNOWN_LANGUAGES = new Set<string>(Object.values(Languages));

/**
 * Splits a flat list of language strings into the known `Languages` enum
 * members and everything else.
 */
export function partitionLanguages(values: Array<string>): {
  languages: Array<Languages>;
  custom_languages: Array<string>;
} {
  const languages: Array<Languages> = [];
  const custom_languages: Array<string> = [];
  for (const value of values) {
    if (KNOWN_LANGUAGES.has(value)) {
      languages.push(value as Languages);
    } else {
      custom_languages.push(value);
    }
  }
  return { languages, custom_languages };
}
