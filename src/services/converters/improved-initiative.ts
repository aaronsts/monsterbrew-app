import { CHALLENGE_RATINGS, CREATURE_TYPES, SKILLS } from "@/lib/constants";
import { defaultCreature } from "@/schema/createCreatureSchema";

export function fromImprovedInitiative(
  source: typeof ImprovedInitiativeCreature
): typeof defaultCreature {
  const conversionIssues = [];
  // Parse speed string into movement components
  const movements = {
    walk: 0,
    swim: 0,
    burrow: 0,
    climb: 0,
    fly: 0,
    hover: source.Speed.some((s: string) => s.toLowerCase().includes("hover")),
  };

  source.Speed.forEach((entry: string) => {
    const parts = entry.split(" ");
    const value = parseInt(parts[1]) || 0;
    if (entry.toLowerCase().includes("swim")) movements.swim = value;
    else if (entry.toLowerCase().includes("walk")) movements.walk = value;
    else if (entry.toLowerCase().includes("burrow")) movements.burrow = value;
    else if (entry.toLowerCase().includes("climb")) movements.climb = value;
    else if (entry.toLowerCase().includes("fly")) movements.fly = value;
  });

  // Parse senses
  const senses = {
    blindsight: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: source.Senses.some((s: string) =>
      s.toLowerCase().includes("blind beyond")
    ),
  };

  source.Senses.forEach((sense: string) => {
    const value = parseInt(sense.match(/\d+/)?.[0] || "0");
    if (sense.toLowerCase().includes("blindsight")) senses.blindsight = value;
    if (sense.toLowerCase().includes("darkvision")) senses.darkvision = value;
    if (sense.toLowerCase().includes("tremorsense")) senses.tremorsense = value;
    if (sense.toLowerCase().includes("truesight")) senses.truesight = value;
  });

  const basicInfo = source.Type.split(", ");

  let cr = CHALLENGE_RATINGS.find(
    (rating) => rating.challenge_rating === source.Challenge
  );

  if (!cr) {
    cr = CHALLENGE_RATINGS[0];
    conversionIssues.push({ name: "CR not found" });
  }

  const skills = source.Skills.map((skl) => {
    const foundSkill = SKILLS.find(
      (s) => s.name.toLowerCase() === skl.Name.toLowerCase()
    );

    if (!foundSkill) {
      conversionIssues.push({ name: "No skill found" });
      return null;
    }

    const isExpert = skl.Modifier >= cr.proficiency_bonus * 2;
    return {
      is_expert: isExpert,
      is_proficient: !isExpert,
      skill_modifier: foundSkill.modifier,
      skill_name: foundSkill.name,
    };
  }).filter((skl) => skl !== null);

  let passivePerception = parseInt(
    source.Senses[source.Senses.length - 1].split(" ")[2]
  );

  if (Number.isNaN(passivePerception)) {
    passivePerception = 10 + source.Abilities.Wis;
    conversionIssues.push({ name: "Passive Perception not found" });
  }

  return {
    name: "Imrpoved Initiative Creature",
    size: basicInfo[0].split(" ")[0].toLowerCase(),
    type: basicInfo[0].split(" ")[1].toLowerCase(),
    alignment: basicInfo[1],

    armor_class: source.AC.Value.toString(),
    armor_description: source.AC.Notes,
    hit_dice: source.HP.Notes.replace(/[()]/g, ""),
    hit_points: source.HP.Value.toString(),
    custom_hp: true,

    movements,

    ability_scores: {
      str: source.Abilities.Str,
      int: source.Abilities.Int,
      dex: source.Abilities.Dex,
      wis: source.Abilities.Wis,
      con: source.Abilities.Con,
      cha: source.Abilities.Cha,
    },
    saving_throws: source.Saves.map((s) => s.Name),

    damage_immunities: source.DamageImmunities,
    condition_immunities: source.ConditionImmunities,
    damage_resistances: source.DamageResistances,
    damage_vulnerabilities: source.DamageVulnerabilities,
    skill_bonuses: skills,
    languages: source.Languages,
    passive_perception: passivePerception,
    senses,

    cr: cr,

    traits: convertToNameAndDescription(source.Traits),
    actions: [
      ...convertToNameAndDescription(source.Actions),
      ...convertToNameAndDescription(source.BonusActions),
    ],
    reactions: convertToNameAndDescription(source.Reactions),

    is_legendary: source.LegendaryActions.length > 0,
    legendary_description: "",
    legendary_actions: convertToNameAndDescription(source.LegendaryActions),

    id: "",
    user_id: "",
    is_public: false,
    environment_id: "",
  };
}

function convertToNameAndDescription(
  actions: { Name: string; Content: string }[]
) {
  return actions.map((a) => ({ name: a.Name, description: a.Content }));
}
