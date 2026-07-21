import {
  findChallengeRating,
  parseOrThrow,
  parseSenses,
  toDamageModifiers,
  toLanguages,
  toSavingThrows,
  toSkills,
} from "./monster-mappers";
import type { z } from "zod";
import type { Monster } from "@/schema/monster-schema";
import { fiveECreatureSchema } from "@/types/5e-tools";

/**
 * Real 5eTools bestiary entries carry dozens of fields we don't use (initiative,
 * soundClip, token art, …), and their shapes drift over time — validating the
 * whole object rejects perfectly good creatures. So we validate only the fields
 * the converter actually reads; everything else is stripped as an unknown key.
 */
const fiveEToolsCreature = fiveECreatureSchema.pick({
  name: true,
  size: true,
  type: true,
  alignment: true,
  ac: true,
  hp: true,
  speed: true,
  str: true,
  dex: true,
  con: true,
  int: true,
  wis: true,
  cha: true,
  save: true,
  skill: true,
  senses: true,
  passive: true,
  languages: true,
  cr: true,
  immune: true,
  resist: true,
  vulnerable: true,
  conditionImmune: true,
  spellcasting: true,
  trait: true,
  action: true,
  bonus: true,
  reaction: true,
  legendaryHeader: true,
  legendary: true,
  mythicHeader: true,
  mythic: true,
});

type Source = z.infer<typeof fiveEToolsCreature>;
type Feature = Monster["traits"][number];

const SIZE_MAP: Record<string, string> = {
  T: "tiny",
  S: "small",
  M: "medium",
  L: "large",
  H: "huge",
  G: "gargantuan",
};

const ALIGNMENT_MAP: Record<string, string> = {
  L: "Lawful",
  N: "Neutral",
  C: "Chaotic",
  G: "Good",
  E: "Evil",
  NX: "Neutral",
  NY: "Neutral",
};

/** Parse and convert raw 5eTools JSON into the canonical `Monster` shape. */
export function from5eTools(raw: unknown): Monster {
  const source = parseOrThrow(fiveEToolsCreature, raw, "5eTools");
  const cr = findChallengeRating(extractCr(source.cr));

  return {
    // Identity
    name: source.name || "",
    type: extractType(source.type),
    size: convertSize(source.size),
    sub_type: "",
    alignment: convertAlignment(source.alignment),
    description: "",
    senses: parseSenses(source.senses ?? []),
    ...toLanguages(source.languages ?? []),
    passive_perception: Number(source.passive) || 0,
    custom_passive_perception: false,

    // Combat
    cr,
    armor_class: extractArmorClass(source.ac),
    armor_description: "",
    hit_points:
      source.hp && "average" in source.hp
        ? String(source.hp.average ?? "")
        : "",
    hit_dice:
      source.hp && "formula" in source.hp
        ? (source.hp.formula?.split("d")[0] ?? "")
        : "",
    custom_hp: false,
    ability_scores: {
      str: extractAbility(source.str),
      dex: extractAbility(source.dex),
      con: extractAbility(source.con),
      int: extractAbility(source.int),
      wis: extractAbility(source.wis),
      cha: extractAbility(source.cha),
    },
    movements: extractMovements(source.speed),

    // Defense
    saving_throws: toSavingThrows(source.save ? Object.keys(source.save) : []),
    skills: toSkills(
      Object.entries(source.skill ?? {}).map(([name, bonus]) => ({
        name,
        isExpert: Number.parseInt(bonus, 10) >= cr.proficiency_bonus * 2,
      })),
    ),
    damage_modifiers: toDamageModifiers({
      immune: flattenDamage(source.immune, "immune"),
      resistant: flattenDamage(source.resist, "resist"),
      vulnerable: flattenDamage(source.vulnerable, "vulnerable"),
    }),
    condition_immunities: flattenDamage(source.conditionImmune, "conditionImmune"),

    // Actions
    traits: convertTraits(source),
    actions: convertFeatures(source.action),
    reactions: convertFeatures(source.reaction),
    bonus_actions: convertFeatures(source.bonus),

    has_lair: false,
    lair_description: "",
    lair_actions: [],

    is_legendary: Boolean(source.legendary),
    legendary_description: getLegendaryDescription(source),
    legendary_actions: convertFeatures(source.legendary),

    is_mythic: Boolean(source.mythic),
    mythic_description: joinEntries(source.mythicHeader),
    mythic_actions: convertFeatures(source.mythic),
  };
}

function joinEntries(entries: unknown): string {
  if (Array.isArray(entries)) return entries.filter((e) => typeof e === "string").join("\n");
  return typeof entries === "string" ? entries : "";
}

function extractType(type: Source["type"]): string {
  if (typeof type === "string") return type;
  if (type && typeof type === "object") {
    if (typeof type.type === "object" && Array.isArray(type.type.choose)) {
      return type.type.choose[0] || "";
    }
    return typeof type.type === "string" ? type.type : "";
  }
  return "";
}

function convertSize(sizes: Source["size"]): string {
  if (!sizes || sizes.length === 0) return "";
  return SIZE_MAP[sizes[0]] || sizes[0].toLowerCase();
}

function convertAlignment(alignment: Source["alignment"]): string {
  if (!alignment || alignment.length === 0) return "Unaligned";
  const values = alignment.filter((a): a is string => typeof a === "string");
  if (values.includes("U")) return "Unaligned";
  if (values.includes("A")) return "Any Alignment";
  const mapped = values.map((a) => ALIGNMENT_MAP[a] || a);
  return mapped.length > 0 ? mapped.join(" ") : "Neutral";
}

function extractArmorClass(ac: Source["ac"]): number {
  if (!ac || ac.length === 0) return 0;
  const first = ac[0];
  if (typeof first === "number") return first;
  if (typeof first === "object" && "ac" in first) return first.ac;
  return 0;
}

function extractAbility(score: Source["str"]): number {
  return typeof score === "number" ? score : 10;
}

function extractMovements(speed: Source["speed"]): Monster["movements"] {
  if (!speed || "special" in speed) {
    return { walk: 30, swim: 0, burrow: 0, climb: 0, fly: 0, hover: false };
  }
  return {
    walk: Number(speed.walk) || 0,
    swim: Number(speed.swim) || 0,
    burrow: Number(speed.burrow) || 0,
    climb: Number(speed.climb) || 0,
    fly: Number(speed.fly) || 0,
    hover: Boolean(speed.canHover),
  };
}

function extractCr(cr: Source["cr"]): string {
  if (!cr) return "0";
  if (typeof cr === "string") return cr;
  if (typeof cr === "object" && "cr" in cr && cr.cr != null) return cr.cr.toString();
  return "0";
}

/**
 * The immune/resist/vulnerable/conditionImmune lists mix plain strings with
 * grouped objects (`{ resist: [...], note }`); flatten both into a string list.
 */
function flattenDamage(
  items: Array<string | Record<string, unknown>> | undefined,
  key: string,
): Array<string> {
  if (!items) return [];
  return items.flatMap((item) => {
    if (typeof item === "string") return item;
    const nested = item[key];
    return Array.isArray(nested) ? (nested as Array<string>) : [];
  });
}

function convertFeatures(
  entries:
    | Array<{ name?: string; entries?: Array<string> | string }>
    | null
    | undefined,
): Array<Feature> {
  if (!entries) return [];
  return entries.map((entry, i) => ({
    name: entry.name || `Entry ${i + 1}`,
    description: Array.isArray(entry.entries)
      ? entry.entries.join("\n")
      : (entry.entries ?? ""),
  }));
}

function convertTraits(source: Source): Array<Feature> {
  const traits: Array<Feature> = convertFeatures(source.trait);

  for (const spellcasting of source.spellcasting ?? []) {
    if (
      spellcasting?.type === "spellcasting" &&
      spellcasting.displayAs !== "action" &&
      spellcasting.displayAs !== "reaction"
    ) {
      const lines: Array<string> = [];
      if (spellcasting.headerEntries) lines.push(spellcasting.headerEntries.join("\n"));
      if (spellcasting.will?.length) lines.push(`At will: ${spellcasting.will.join(", ")}`);
      if (spellcasting.daily) {
        for (const [times, spells] of Object.entries(spellcasting.daily)) {
          lines.push(`${times}/day: ${(spells as Array<string>).join(", ")}`);
        }
      }
      traits.push({
        name: spellcasting.name || "Spellcasting",
        description: lines.join("\n").trim(),
      });
    }
  }

  return traits;
}

function getLegendaryDescription(source: Source): string {
  if (source.legendaryHeader) return joinEntries(source.legendaryHeader);
  if (source.legendary) {
    return `The ${source.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${source.name} regains spent legendary actions at the start of its turn.`;
  }
  return "";
}
