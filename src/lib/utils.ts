import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStatBonus(value: number | undefined) {
  if (!value) return 0;
  return Math.floor(value / 2) - 5 >= 0
    ? Math.floor(value / 2) - 5
    : Math.floor(value / 2) - 5;
}

export function titleCase(str: string) {
  return str
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => " " + c.toUpperCase());
}
