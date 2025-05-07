import { CHALLENGE_RATINGS } from "@/lib/constants";
import { SKILLS } from "@/lib/skills";
import { defaultCreature, Languages } from "@/schema/createCreatureSchema";
import { Open5eCreature } from "@/types/open5e";

export function fromOpen5e(source: Open5eCreature): typeof defaultCreature {
  const conversionIssues = [];

  let cr = CHALLENGE_RATINGS.find((rating) => {
    return rating.challenge_rating === source.cr.toString();
  });

  switch (source.cr) {
    case 0.125:
      cr = CHALLENGE_RATINGS[1];
    case 0.25:
      cr = CHALLENGE_RATINGS[2];
    case 0.5:
      cr = CHALLENGE_RATINGS[3];
  }

  if (!cr) {
    cr = CHALLENGE_RATINGS[0];
    conversionIssues.push({ name: "CR not found" });
  }

  const savingThrows = [
    !!source.strength_save ? "str" : "",
    !!source.dexterity_save ? "dex" : "",
    !!source.constitution_save ? "con" : "",
    !!source.intelligence_save ? "int" : "",
    !!source.wisdom_save ? "wis" : "",
    !!source.charisma_save ? "cha" : "",
  ];

  const skills = Object.entries(source.skills)
    .map((skl) => {
      const foundSkill = SKILLS.find(
        (s) => s.skill_name.toLowerCase() === skl[0].toLowerCase()
      );

      if (!foundSkill) {
        conversionIssues.push({ name: "No skill found" });
        return null;
      }

      const isExpert = skl[1] >= cr.proficiency_bonus * 2;
      return {
        is_expert: isExpert,
        is_proficient: !isExpert,
        skill_modifier: foundSkill.skill_modifier,
        skill_name: foundSkill.skill_name,
      };
    })
    .filter((skl) => skl !== null);

  // Parse senses
  const senses = {
    blindsight: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: source.senses.includes("blind beyond"),
  };

  source.senses.split(", ").forEach((sense: string) => {
    const value = parseInt(sense.match(/\d+/)?.[0] || "0");
    if (sense.toLowerCase().includes("blindsight")) senses.blindsight = value;
    if (sense.toLowerCase().includes("darkvision")) senses.darkvision = value;
    if (sense.toLowerCase().includes("tremorsense")) senses.tremorsense = value;
    if (sense.toLowerCase().includes("truesight")) senses.truesight = value;
  });

  return {
    name: source.name,
    size: source.size.toLowerCase(),
    type: source.type.toLowerCase(),
    alignment: source.alignment,

    armor_class: source.armor_class,
    armor_description: source.armor_desc,
    hit_dice: source.hit_dice.split("d")[0],
    hit_points: source.hit_points.toString(),
    custom_hp: false,

    movements: {
      walk: source.speed?.walk || 0,
      swim: source.speed.swim || 0,
      burrow: source.speed.burrow || 0,
      climb: source.speed.climb || 0,
      fly: source.speed.fly || 0,
      hover: !!source.speed.hover,
    },

    ability_scores: {
      str: source.strength,
      int: source.intelligence,
      dex: source.dexterity,
      wis: source.wisdom,
      con: source.constitution,
      cha: source.charisma,
    },
    saving_throws: savingThrows,
    senses,

    nonmagical_attack_immunity: false,
    nonmagical_attack_resistance: false,
    damage_immunities:
      source.damage_immunities.length !== 0
        ? source.damage_immunities.split(", ")
        : [],
    condition_immunities:
      source.condition_immunities.length !== 0
        ? source.condition_immunities.split(", ")
        : [],
    damage_resistances:
      source.damage_resistances.length !== 0
        ? source.damage_resistances.split(", ")
        : [],
    damage_vulnerabilities:
      source.damage_vulnerabilities.length !== 0
        ? source.damage_vulnerabilities.split(", ")
        : [],

    skill_bonuses: skills,
    languages: source.languages.split(", ") as Languages[],
    passive_perception: parseInt(source.senses.split("passive Perception ")[1]),

    cr: cr,

    traits: convertToNameAndDescription(source.special_abilities),
    actions: convertToNameAndDescription(source.actions),
    reactions: convertToNameAndDescription(source.reactions),

    is_legendary: !!source.legendary_desc,
    legendary_description: source.legendary_desc,
    legendary_actions: convertToNameAndDescription(source.legendary_actions),

    is_mythic: false,
    mythic_description: "",
    mythic_actions: [],

    id: "",
    user_id: "",
    is_public: false,
    environment_id: source.environments.join(", "),
  };
}

function convertToNameAndDescription(actions: Open5eCreature["reactions"]) {
  if (!actions) return [];
  return actions.map((a) => ({ name: a.name, description: a.desc }));
}
