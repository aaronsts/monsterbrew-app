import { z } from "zod";
import { abilityScoresSchema, Monster } from "@/schema/monster-schema";
import { CHALLENGE_RATINGS } from "@/lib/constants";
import { SKILLS } from "@/lib/skills";
import { partitionLanguages } from "@/lib/utils";

/**
 * Validate `raw` against a source-format schema, returning the parsed value or
 * throwing a concise, human-readable error naming the offending fields (so the
 * import dialog can surface it in a toast instead of a raw ZodError dump).
 */
export function parseOrThrow<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
  format: string,
): z.infer<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fields = [
      ...new Set(
        result.error.issues.map((issue) => issue.path[0]).filter(Boolean),
      ),
    ];
    throw new Error(
      `Not a valid ${format} creature${
        fields.length ? ` (check: ${fields.join(", ")})` : ""
      }`,
    );
  }
  return result.data;
}

export const ABILITY_KEYS = abilityScoresSchema.keyof().options;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

const ABILITY_KEY_SET = new Set<string>(ABILITY_KEYS);
const SKILL_NAMES = new Set<string>(SKILLS.map((s) => s.skill_name));

/** Normalise an ability label ("Dex", "strength", "con") to a 3-letter key. */
export function toAbilityKey(name: string): AbilityKey | null {
  const key = name.trim().toLowerCase().slice(0, 3);
  return ABILITY_KEY_SET.has(key) ? (key as AbilityKey) : null;
}

/** `["Dex", "Con"]` / `["strength", ""]` -> `{ dex: true, con: true }`. */
export function toSavingThrows(
  names: Array<string | null | undefined>,
): Monster["saving_throws"] {
  const result: Monster["saving_throws"] = {};
  for (const name of names) {
    if (!name) continue;
    const key = toAbilityKey(name);
    if (key) result[key] = true;
  }
  return result;
}

export interface SkillEntry {
  name: string;
  isExpert?: boolean;
}

/** `[{ name: "Perception", isExpert: true }]` -> `{ perception: "expert" }`. */
export function toSkills(
  entries: SkillEntry[],
): NonNullable<Monster["skills"]> {
  const result: NonNullable<Monster["skills"]> = {};
  for (const { name, isExpert } of entries) {
    const key = name.trim().toLowerCase();
    if (!SKILL_NAMES.has(key)) continue;
    result[key] = isExpert ? "expert" : "proficient";
  }
  return result;
}

export interface DamageGroups {
  immune?: string[];
  resistant?: string[];
  vulnerable?: string[];
}

export function toDamageModifiers(
  groups: DamageGroups,
): NonNullable<Monster["damage_modifiers"]> {
  const result: NonNullable<Monster["damage_modifiers"]> = {};
  const assign = (
    types: string[] | undefined,
    state: "vulnerable" | "resistant" | "immune",
  ) => {
    for (const type of types ?? []) {
      const key = type.trim().toLowerCase();
      if (key) result[key] = state;
    }
  };
  assign(groups.vulnerable, "vulnerable");
  assign(groups.resistant, "resistant");
  assign(groups.immune, "immune");
  return result;
}

/** Split language strings into the known enum members and free-text extras. */
export function toLanguages(values: Array<string | null | undefined>): {
  languages: Monster["languages"];
  custom_languages: Monster["custom_languages"];
} {
  const cleaned = values
    .filter((v): v is string => !!v && v.trim().length > 0)
    .map((v) => v.trim().toLowerCase());
  return partitionLanguages(cleaned);
}

/** Resolve a CR string/number to the matching CHALLENGE_RATINGS row (or CR 0). */
export function findChallengeRating(
  cr: string | number | null | undefined,
): Monster["cr"] {
  const normalized = normalizeChallengeRating(cr);
  return (
    CHALLENGE_RATINGS.find((c) => c.challenge_rating === normalized) ??
    CHALLENGE_RATINGS[0]
  );
}

function normalizeChallengeRating(
  cr: string | number | null | undefined,
): string {
  if (cr === null || cr === undefined) return "0";
  const fractions: Record<string, string> = {
    "0.125": "1/8",
    "0.25": "1/4",
    "0.5": "1/2",
  };
  if (typeof cr === "number") {
    return fractions[cr.toString()] ?? cr.toString();
  }
  return fractions[cr.trim()] ?? cr.trim();
}

/** Parse "passive Perception 26" out of a list of sense strings. */
export function parsePassivePerception(
  senses: Array<string | null | undefined>,
): number | null {
  for (const sense of senses) {
    const match = sense?.match(/passive perception\s+(\d+)/i);
    if (match) return Number.parseInt(match[1], 10);
  }
  return null;
}

/** Parse a list of sense strings ("blindsight 60 ft.", …) into the senses object. */
export function parseSenses(
  senses: Array<string | null | undefined>,
): Monster["senses"] {
  const result: Monster["senses"] = {
    blindsight: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: false,
  };
  for (const raw of senses) {
    if (!raw) continue;
    const sense = raw.toLowerCase();
    const value = Number.parseInt(sense.match(/\d+/)?.[0] ?? "0", 10);
    if (sense.includes("blindsight")) {
      result.blindsight = value;
      if (sense.includes("blind beyond")) result.is_blind_beyond = true;
    }
    if (sense.includes("darkvision")) result.darkvision = value;
    if (sense.includes("tremorsense")) result.tremorsense = value;
    if (sense.includes("truesight")) result.truesight = value;
  }
  return result;
}
