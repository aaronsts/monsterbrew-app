import { Monster } from "@/schema/monster-schema";
import { open5eSchema, Open5eCreature } from "@/types/open-5e";
import { calculateStatBonus } from "@/lib/utils";
import {
  findChallengeRating,
  parseOrThrow,
  parsePassivePerception,
  parseSenses,
  toDamageModifiers,
  toLanguages,
  toSavingThrows,
  toSkills,
} from "./monster-mappers";

type Action = NonNullable<Open5eCreature["reactions"]>[number];

function toFeatures(entries: Action[] | null | undefined): Monster["traits"] {
  if (!entries) return [];
  return entries.map((entry) => ({ name: entry.name, description: entry.desc }));
}

/** Split a comma-separated Open5e list ("fire, cold") into a trimmed array. */
function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Convert an Open5e (v1) creature into the canonical `Monster` shape. */
export function fromOpen5e(raw: unknown): Monster {
  const source = parseOrThrow(open5eSchema, raw, "Open5e");
  const cr = findChallengeRating(source.cr);

  const savingThrows: Array<string | null> = [
    source.strength_save ? "str" : null,
    source.dexterity_save ? "dex" : null,
    source.constitution_save ? "con" : null,
    source.intelligence_save ? "int" : null,
    source.wisdom_save ? "wis" : null,
    source.charisma_save ? "cha" : null,
  ];

  const senseStrings = source.senses ? source.senses.split(",") : [];
  const passivePerception =
    parsePassivePerception(senseStrings) ??
    10 + calculateStatBonus(source.wisdom) + (source.perception || 0);

  return {
    // Identity
    name: source.name,
    type: source.type.toLowerCase(),
    size: source.size.toLowerCase(),
    sub_type: source.subtype ?? "",
    alignment: source.alignment,
    description: source.desc ?? "",
    senses: parseSenses(senseStrings),
    ...toLanguages(source.languages ? splitList(source.languages) : []),
    passive_perception: passivePerception,
    custom_passive_perception: false,

    // Combat
    cr,
    armor_class: source.armor_class,
    armor_description: source.armor_desc,
    hit_points: source.hit_points.toString(),
    hit_dice: source.hit_dice.split("d")[0],
    custom_hp: false,
    ability_scores: {
      str: source.strength,
      dex: source.dexterity,
      con: source.constitution,
      int: source.intelligence,
      wis: source.wisdom,
      cha: source.charisma,
    },
    movements: {
      walk: source.speed?.walk || 0,
      swim: source.speed?.swim || 0,
      burrow: source.speed?.burrow || 0,
      climb: source.speed?.climb || 0,
      fly: source.speed?.fly || 0,
      hover: Boolean(source.speed?.hover),
    },

    // Defense
    saving_throws: toSavingThrows(savingThrows),
    skills: toSkills(
      Object.entries(source.skills ?? {}).map(([name, bonus]) => ({
        name,
        isExpert: bonus >= cr.proficiency_bonus * 2,
      })),
    ),
    damage_modifiers: toDamageModifiers({
      immune: splitList(source.damage_immunities),
      resistant: splitList(source.damage_resistances),
      vulnerable: splitList(source.damage_vulnerabilities),
    }),
    condition_immunities: splitList(source.condition_immunities),

    // Actions
    traits: toFeatures(source.special_abilities),
    actions: toFeatures(source.actions),
    reactions: toFeatures(source.reactions),
    bonus_actions: toFeatures(source.bonus_actions),

    has_lair: false,
    lair_description: "",
    lair_actions: [],

    is_legendary: Boolean(source.legendary_desc),
    legendary_description: source.legendary_desc ?? "",
    legendary_actions: toFeatures(source.legendary_actions),

    is_mythic: false,
    mythic_description: "",
    mythic_actions: [],
  };
}
