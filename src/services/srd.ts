import type { Monster } from "@/schema/monster-schema";
import srdData from "@/data/srd-monsters.json";
import { fromSrd } from "@/services/converters/from-srd";

export interface SrdEntry {
  /** Stable SRD identifier, used for routing (`/library/srd/$key`). */
  key: string;
  monster: Monster;
}

let cache: Array<SrdEntry> | null = null;

/** All SRD monsters converted to the canonical `Monster` shape (memoized). */
export function getSrdMonsters(): Array<SrdEntry> {
  if (cache) return cache;
  cache = (srdData as Array<{ key: string }>)
    .map((raw) => ({ key: raw.key, monster: fromSrd(raw) }))
    .sort((a, b) => a.monster.name.localeCompare(b.monster.name));
  return cache;
}

/** Look up a single SRD monster by its key. */
export function getSrdMonster(key: string): SrdEntry | undefined {
  return getSrdMonsters().find((entry) => entry.key === key);
}
