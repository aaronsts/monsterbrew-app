import { Monster } from "@/schema/monster-schema";
import { SKILLS } from "@/lib/skills";
import {
  findChallengeRating,
  parsePassivePerception,
  parseSenses,
  toDamageModifiers,
  toLanguages,
  toSavingThrows,
  toSkills,
  SkillEntry,
} from "./monster-mappers";

type Source = typeof ImprovedInitiativeCreature;

const SKILL_NAME_SET = new Set<string>(SKILLS.map((s) => s.skill_name));

function toFeatures(
  entries: { Name: string; Content: string }[],
): Monster["traits"] {
  return entries.map((entry) => ({
    name: entry.Name,
    description: entry.Content,
  }));
}

/** Convert an Improved Initiative export into the canonical `Monster` shape. */
export function fromImprovedInitiative(source: Source): Monster {
  const cr = findChallengeRating(source.Challenge);

  // "Speed": ["walk 40 ft.", "fly 80 ft."] -> movement object.
  const movements: Monster["movements"] = {
    walk: 0,
    swim: 0,
    burrow: 0,
    climb: 0,
    fly: 0,
    hover: source.Speed.some((s) => s.toLowerCase().includes("hover")),
  };
  for (const entry of source.Speed) {
    const value = Number.parseInt(entry.replace(/[^0-9]/g, " ").trim(), 10) || 0;
    const label = entry.toLowerCase();
    if (label.includes("swim")) movements.swim = value;
    else if (label.includes("burrow")) movements.burrow = value;
    else if (label.includes("climb")) movements.climb = value;
    else if (label.includes("fly")) movements.fly = value;
    else if (label.includes("walk")) movements.walk = value;
  }

  const skills: SkillEntry[] = source.Skills.filter((skl) =>
    SKILL_NAME_SET.has(skl.Name.trim().toLowerCase()),
  ).map((skl) => ({
    name: skl.Name,
    isExpert: skl.Modifier >= cr.proficiency_bonus * 2,
  }));

  // "Gargantuan Dragon, chaotic evil" -> size / type / alignment.
  const [creatureInfo, alignment = ""] = source.Type.split(",").map((part) =>
    part.trim(),
  );
  const [size = "", type = ""] = creatureInfo.split(" ");

  const passivePerception =
    parsePassivePerception(source.Senses) ?? 10 + source.Abilities.Wis;

  return {
    // Identity
    name: source.Description || "Imported creature",
    type: type.toLowerCase(),
    size: size.toLowerCase(),
    sub_type: "",
    alignment,
    description: "",
    senses: parseSenses(source.Senses),
    ...toLanguages(source.Languages),
    passive_perception: passivePerception,
    custom_passive_perception: true,

    // Combat
    cr,
    armor_class: source.AC.Value,
    armor_description: source.AC.Notes,
    hit_points: `${source.HP.Value} ${source.HP.Notes}`.trim(),
    hit_dice: "",
    custom_hp: true,
    ability_scores: {
      str: source.Abilities.Str,
      dex: source.Abilities.Dex,
      con: source.Abilities.Con,
      int: source.Abilities.Int,
      wis: source.Abilities.Wis,
      cha: source.Abilities.Cha,
    },
    movements,

    // Defense
    saving_throws: toSavingThrows(source.Saves.map((s) => s.Name)),
    skills: toSkills(skills),
    damage_modifiers: toDamageModifiers({
      immune: source.DamageImmunities,
      resistant: source.DamageResistances,
      vulnerable: source.DamageVulnerabilities,
    }),
    condition_immunities: source.ConditionImmunities.filter(Boolean),

    // Actions
    traits: toFeatures(source.Traits),
    actions: toFeatures(source.Actions),
    reactions: toFeatures(source.Reactions),
    bonus_actions: toFeatures(source.BonusActions),

    has_lair: false,
    lair_description: "",
    lair_actions: [],

    is_legendary: source.LegendaryActions.length > 0,
    legendary_description: "",
    legendary_actions: toFeatures(source.LegendaryActions),

    is_mythic: source.MythicActions.length > 0,
    mythic_description: "",
    mythic_actions: toFeatures(source.MythicActions),
  };
}
