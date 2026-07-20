import { Monster } from "@/schema/monster-schema";
import { tetraCubeSchema } from "@/types/tetra-cube";
import { calculateStatBonus } from "@/lib/utils";
import {
  findChallengeRating,
  parseOrThrow,
  toDamageModifiers,
  toLanguages,
  toSavingThrows,
  toSkills,
} from "./monster-mappers";

function toFeatures(
  entries: { name: string; desc: string }[],
): Monster["traits"] {
  return entries.map((entry) => ({ name: entry.name, description: entry.desc }));
}

/** Convert a TetraCube export into the canonical `Monster` shape. */
export function fromTetraCube(raw: unknown): Monster {
  const source = parseOrThrow(tetraCubeSchema, raw, "TetraCube");
  const cr = findChallengeRating(source.customCr || source.cr);

  const perceptionSkill = source.skills.find((s) => s.name === "perception");
  const passivePerception =
    10 +
    calculateStatBonus(source.wisPoints) +
    (perceptionSkill ? source.customProf : 0);

  const byDamageType = (type: string) =>
    source.damagetypes.filter((d) => d.type === type).map((d) => d.name);

  return {
    // Identity
    name: source.name,
    type: source.type.toLowerCase(),
    size: source.size.toLowerCase(),
    sub_type: source.tag ?? "",
    alignment: source.alignment,
    description: "",
    senses: {
      blindsight: source.blindsight,
      darkvision: source.darkvision,
      tremorsense: source.tremorsense,
      truesight: source.truesight,
      is_blind_beyond: source.blind,
    },
    ...toLanguages(source.languages.map((l) => l.name)),
    passive_perception: passivePerception,
    custom_passive_perception: false,

    // Combat
    cr,
    armor_class: Number.parseInt(source.otherArmorDesc, 10) || 0,
    armor_description: source.armorName,
    hit_points: source.hpText,
    hit_dice: source.hitDice.toString(),
    custom_hp: source.customHP,
    ability_scores: {
      str: source.strPoints,
      dex: source.dexPoints,
      con: source.conPoints,
      int: source.intPoints,
      wis: source.wisPoints,
      cha: source.chaPoints,
    },
    movements: {
      walk: source.speed,
      swim: source.swimSpeed,
      burrow: source.burrowSpeed,
      climb: source.climbSpeed,
      fly: source.flySpeed,
      hover: source.hover,
    },

    // Defense
    saving_throws: toSavingThrows(source.sthrows.map((s) => s.name)),
    skills: toSkills(
      source.skills.map((skl) => ({
        name: skl.name,
        isExpert: Boolean(skl.note?.includes("ex")),
      })),
    ),
    damage_modifiers: toDamageModifiers({
      immune: byDamageType("i"),
      resistant: byDamageType("r"),
      vulnerable: byDamageType("v"),
    }),
    condition_immunities: source.conditions.map((c) => c.name),

    // Actions
    traits: toFeatures(source.abilities),
    actions: toFeatures(source.actions),
    reactions: toFeatures(source.reactions),
    bonus_actions: toFeatures(source.bonusActions),

    has_lair: source.isLair,
    lair_description: source.lairDescription,
    lair_actions: toFeatures(source.lairs),

    is_legendary: source.isLegendary,
    legendary_description: source.legendariesDescription,
    legendary_actions: toFeatures(source.legendaries),

    is_mythic: source.isMythic,
    mythic_description: source.mythicDescription,
    mythic_actions: toFeatures(source.mythics),
  };
}
