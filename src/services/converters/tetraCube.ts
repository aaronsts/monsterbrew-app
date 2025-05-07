import { CHALLENGE_RATINGS } from "@/lib/constants";
import { defaultCreature, Languages } from "@/schema/createCreatureSchema";
import { TetraCubeCreature } from "@/types/tetraCube";

export function fromTetacube(
  source: TetraCubeCreature
): typeof defaultCreature {
  // Calculate passive perception from skills
  const perceptionSkill = source.skills.find((s) => s.name === "perception");
  const wisMod = Math.floor((source.wisPoints - 10) / 2);
  const passivePerception =
    10 + wisMod + (perceptionSkill ? source.customProf : 0);

  // Map damage immunities/resistances
  const damageImmunities = source.damagetypes
    .filter((d) => d.type === "i")
    .map((d) => d.name);

  const damageResistances = source.damagetypes
    .filter((d) => d.type === "r")
    .map((d) => d.name);

  const damageVulnerabilities = source.damagetypes
    .filter((d) => d.type === "v")
    .map((d) => d.name);

  const skills = source.skills
    .map((skl) => {
      const isExpert = skl.note?.includes("ex");
      return {
        is_expert: isExpert,
        is_proficient: !isExpert,
        skill_modifier: skl.stat,
        skill_name: skl.name,
      };
    })
    .filter((skl) => skl !== null);

  const cr =
    CHALLENGE_RATINGS.find((clr) => clr.challenge_rating === source.cr) ||
    CHALLENGE_RATINGS[0];

  return {
    name: source.name,
    size: source.size,
    type: source.type.toLowerCase(),
    alignment: source.alignment,

    armor_class: parseInt(source.otherArmorDesc.split(" ")[0]), // Extract "22" from "22 (natural armor)"
    armor_description: source.armorName,
    hit_dice: source.hitDice.toString(),
    hit_points: source.hpText,
    custom_hp: source.customHP,

    movements: {
      walk: source.speed,
      swim: source.swimSpeed,
      burrow: source.burrowSpeed,
      climb: source.climbSpeed,
      fly: source.flySpeed,
      hover: source.hover,
    },

    ability_scores: {
      str: source.strPoints,
      int: source.intPoints,
      dex: source.dexPoints,
      wis: source.wisPoints,
      con: source.conPoints,
      cha: source.chaPoints,
    },
    saving_throws: source.sthrows.map((s) => s.name),

    nonmagical_attack_immunity: false,
    nonmagical_attack_resistance: false,
    damage_immunities: damageImmunities,
    condition_immunities: source.conditions.map((c) => c.name),
    damage_resistances: damageResistances,
    damage_vulnerabilities: damageVulnerabilities,
    skill_bonuses: skills,
    languages: source.languages.map((l) => l.name) as Languages[],
    passive_perception: passivePerception,
    senses: {
      blindsight: source.blindsight,
      darkvision: source.darkvision,
      tremorsense: source.tremorsense,
      truesight: source.truesight,
      is_blind_beyond: source.blind,
    },

    cr: cr,

    traits: convertToNameAndDescription(source.abilities),
    actions: convertToNameAndDescription(source.actions),
    reactions: convertToNameAndDescription(source.reactions),

    is_legendary: source.isLegendary,
    legendary_description: source.legendariesDescription,
    legendary_actions: convertToNameAndDescription(source.legendaries),

    is_mythic: source.isMythic,
    mythic_description: source.mythicDescription,
    mythic_actions: convertToNameAndDescription(source.mythics),

    id: "",
    user_id: "", // No direct equivalent in source
    is_public: false,
    environment_id: "",
  };
}

function convertToNameAndDescription(
  actions: { name: string; desc: string }[]
) {
  return actions.map((a) => ({ name: a.name, description: a.desc }));
}
