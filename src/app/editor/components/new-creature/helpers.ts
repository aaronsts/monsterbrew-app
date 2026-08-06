import type { Monster, StoredMonster } from "@/schema/monster-schema";

/**
 * Structurally the same as `SrdEntry`, declared locally on purpose: importing
 * anything at all from `@/services/srd` — even a type — invites someone to
 * later drop the `type` keyword and pull the 660 KB bestiary into the editor's
 * initial load. See the dynamic import in `srd-picker.tsx`.
 */
export type CreatureSource = "personal" | "srd";

export interface CreatureEntry {
  key: string;
  monster: Monster;
  source: CreatureSource;
  /**
   * The stored id, on your own creatures only. The picker deliberately does
   * *not* pass it to the editor — picking here starts a fresh, unsaved copy,
   * unlike the Recent list, which opens a creature for editing in place.
   */
  id?: string;
}

/** The picker's filter state. `"all"` means "don't filter on this". */
export interface CreatureFilters {
  search: string;
  source: string;
  size: string;
  type: string;
  cr: string;
}

export const NO_CREATURE_FILTERS: CreatureFilters = {
  search: "",
  source: "all",
  size: "all",
  type: "all",
  cr: "all",
};

/** Whether any filter would actually narrow the list. */
export function hasActiveCreatureFilters(filters: CreatureFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.source !== "all" ||
    filters.size !== "all" ||
    filters.type !== "all" ||
    filters.cr !== "all"
  );
}

/**
 * One list from both sources: your saved creatures first, most recently
 * touched first, then the bestiary in the order it already comes in
 * (alphabetical). Yours lead because there are a handful of them and hundreds
 * of SRD monsters.
 *
 * Saved keys are namespaced (`personal:<id>`) so a creature whose id happens to
 * match an SRD key can't collide with it in the rendered list.
 */
export function mergeCreatureEntries(
  saved: Array<StoredMonster>,
  srd: Array<{ key: string; monster: Monster }>,
): Array<CreatureEntry> {
  return [
    ...recentCreatures(saved, saved.length).map((creature) => ({
      key: `personal:${creature.id}`,
      monster: creature,
      source: "personal" as const,
      id: creature.id,
    })),
    ...srd.map((entry) => ({
      key: entry.key,
      monster: entry.monster,
      source: "srd" as const,
    })),
  ];
}

export function filterCreatureEntries(
  entries: Array<CreatureEntry>,
  filters: CreatureFilters,
): Array<CreatureEntry> {
  const query = filters.search.trim().toLowerCase();

  return entries.filter(({ monster, source }) => {
    if (query && !monster.name.toLowerCase().includes(query)) return false;
    if (filters.source !== "all" && source !== filters.source) return false;
    if (filters.size !== "all" && monster.size.toLowerCase() !== filters.size) {
      return false;
    }
    if (filters.type !== "all" && monster.type.toLowerCase() !== filters.type) {
      return false;
    }
    if (filters.cr !== "all" && monster.cr.challenge_rating !== filters.cr) {
      return false;
    }
    return true;
  });
}

/**
 * When a record was last touched, as ms since the epoch.
 *
 * `updated_at` is stamped by `saveCreature`, but records written before that
 * existed — and anything seeded straight into IndexedDB — carry no stamp. For
 * those, fall back to the creation time embedded in the id by `generateId()`
 * (`${Date.now()}-${random}`). Both clocks are ms since the epoch, so the two
 * kinds of record sort against each other correctly.
 *
 * Returns `NaN` for ids that were not produced by `generateId()` (legacy or
 * hand-written records), which the sort pushes to the end.
 */
function lastTouched(creature: StoredMonster): number {
  if (typeof creature.updated_at === "number") return creature.updated_at;
  return Number(creature.id.split("-")[0]);
}

/**
 * The `limit` most recently touched creatures, newest first. Records with no
 * usable timestamp sort last, alphabetically. Does not mutate the input.
 */
export function recentCreatures(
  creatures: Array<StoredMonster>,
  limit: number,
): Array<StoredMonster> {
  return [...creatures]
    .sort((a, b) => {
      const aTime = lastTouched(a);
      const bTime = lastTouched(b);
      const aDated = Number.isFinite(aTime);
      const bDated = Number.isFinite(bTime);
      if (aDated && bDated) return bTime - aTime;
      if (aDated !== bDated) return aDated ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

/**
 * The `Monster` to load into the editor for a picked entry.
 *
 * Your own creatures are stored records, so they carry `id` (and possibly
 * `is_public`). Those are storage identity, not creature data: the picker
 * starts a **new** creature, so they are dropped rather than handed to a form
 * whose save path would then be aiming at the original record.
 */
export function starterFromEntry(entry: CreatureEntry): Monster {
  if (entry.source !== "personal") return entry.monster;
  const {
    id: _id,
    is_public: _isPublic,
    ...monster
  } = entry.monster as StoredMonster;
  return monster;
}
