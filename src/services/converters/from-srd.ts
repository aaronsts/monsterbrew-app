import {
  findChallengeRating,
  parseOrThrow,
  toDamageModifiers,
  toLanguages,
  toSavingThrows,
  toSkills,
} from "./monster-mappers";
import type { Monster } from "@/schema/monster-schema";
import type { SrdMonster } from "@/types/srd";
import { srdMonsterSchema } from "@/types/srd";
import { calculateStatBonus } from "@/lib/utils";

const ABILITY_KEYS: Record<keyof SrdMonster["ability_scores"], string> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
};

/** Split a display list ("fire, cold; poison") into trimmed, non-empty parts. */
function splitDisplay(value: string | undefined): Array<string> {
  return (value ?? "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFeatures(
  entries: Array<{ name: string; desc: string }>,
): Monster["traits"] {
  return entries.map((entry) => ({ name: entry.name, description: entry.desc }));
}

/** Convert a D&D 2024 SRD monster entry into the canonical `Monster` shape. */
export function fromSrd(raw: unknown): Monster {
  const source = parseOrThrow(srdMonsterSchema, raw, "SRD");
  const cr = findChallengeRating(source.challenge_rating_text);

  // A save is proficient when its bonus exceeds the raw ability modifier.
  const savingThrows: Array<string | null> = Object.entries(ABILITY_KEYS).map(
    ([fullName, key]) => {
      const score =
        source.ability_scores[fullName as keyof SrdMonster["ability_scores"]];
      const bonus = source.saving_throws[fullName];
      if (bonus === undefined) return null;
      return bonus > calculateStatBonus(score) ? key : null;
    },
  );

  // Expertise shows up as a bonus of at least double proficiency over the mod.
  const skills = Object.entries(source.skill_bonuses).map(([name, bonus]) => {
    const skillName = name.replace(/_/g, " ");
    const proficiencyPortion = bonus - abilityModForSkill(source, skillName);
    return {
      name: skillName,
      isExpert: proficiencyPortion >= cr.proficiency_bonus * 2,
    };
  });

  const actions = source.actions.filter(
    (a) => a.action_type !== "LEGENDARY_ACTION",
  );
  const legendaryActions = source.actions.filter(
    (a) => a.action_type === "LEGENDARY_ACTION",
  );

  const res = source.resistances_and_immunities;

  return {
    // Identity
    name: source.name,
    type: source.type.toLowerCase(),
    size: source.size.toLowerCase(),
    sub_type: source.subcategory ?? "",
    alignment: source.alignment,
    description: "",
    senses: {
      blindsight: source.blindsight_range ?? 0,
      darkvision: source.darkvision_range ?? 0,
      tremorsense: source.tremorsense_range ?? 0,
      truesight: source.truesight_range ?? 0,
      is_blind_beyond: false,
    },
    ...toLanguages(splitDisplay(source.languages)),
    passive_perception: source.passive_perception,
    custom_passive_perception: false,

    // Combat
    cr,
    armor_class: source.armor_class,
    armor_description: source.armor_detail,
    hit_points: source.hit_points.toString(),
    hit_dice: source.hit_dice.split("d")[0].trim(),
    custom_hp: false,
    ability_scores: {
      str: source.ability_scores.strength,
      dex: source.ability_scores.dexterity,
      con: source.ability_scores.constitution,
      int: source.ability_scores.intelligence,
      wis: source.ability_scores.wisdom,
      cha: source.ability_scores.charisma,
    },
    movements: {
      walk: source.speed.walk ?? 0,
      swim: source.speed.swim ?? 0,
      burrow: source.speed.burrow ?? 0,
      climb: source.speed.climb ?? 0,
      fly: source.speed.fly ?? 0,
      hover: Boolean(source.speed.hover),
    },

    // Defense
    saving_throws: toSavingThrows(savingThrows),
    skills: toSkills(skills),
    damage_modifiers: toDamageModifiers({
      immune: splitDisplay(res.damage_immunities_display),
      resistant: splitDisplay(res.damage_resistances_display),
      vulnerable: splitDisplay(res.damage_vulnerabilities_display),
    }),
    condition_immunities: splitDisplay(res.condition_immunities_display),

    // Actions
    traits: toFeatures(source.traits),
    actions: toFeatures(actions),
    reactions: [],
    bonus_actions: [],

    has_lair: false,
    lair_description: "",
    lair_actions: [],

    is_legendary: legendaryActions.length > 0,
    legendary_description: "",
    legendary_actions: toFeatures(legendaryActions),

    is_mythic: false,
    mythic_description: "",
    mythic_actions: [],
  };
}

const SKILL_ABILITY: Record<string, keyof SrdMonster["ability_scores"]> = {
  athletics: "strength",
  acrobatics: "dexterity",
  "sleight of hand": "dexterity",
  stealth: "dexterity",
  arcana: "intelligence",
  history: "intelligence",
  investigation: "intelligence",
  nature: "intelligence",
  religion: "intelligence",
  "animal handling": "wisdom",
  insight: "wisdom",
  medicine: "wisdom",
  perception: "wisdom",
  survival: "wisdom",
  deception: "charisma",
  intimidation: "charisma",
  performance: "charisma",
  persuasion: "charisma",
};

function abilityModForSkill(source: SrdMonster, skillName: string): number {
  const ability = SKILL_ABILITY[skillName];
  if (!ability) return 0;
  return calculateStatBonus(source.ability_scores[ability]);
}
