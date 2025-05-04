import { CHALLENGE_RATINGS } from "@/lib/constants";
import { SKILLS } from "@/lib/skills";
import { calculateStatBonus, titleCase } from "@/lib/utils";
import { defaultCreature, Languages } from "@/schema/createCreatureSchema";

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
    crawl: 0,
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
      (s) => s.skill_name.toLowerCase() === skl.Name.toLowerCase()
    );

    if (!foundSkill) {
      conversionIssues.push({ name: "No skill found" });
      return null;
    }

    const isExpert = skl.Modifier >= cr.proficiency_bonus * 2;
    return {
      is_expert: isExpert,
      is_proficient: !isExpert,
      skill_modifier: foundSkill.skill_modifier,
      skill_name: foundSkill.skill_name,
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
    hit_dice: "",
    hit_points: `${source.HP.Value} ${source.HP.Notes}`,
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
    languages: source.Languages.map(
      (l) => Languages[l as keyof typeof Languages]
    ),
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

    is_mythic: source.MythicActions.length > 0,
    mythic_description: "",
    mythic_actions: convertToNameAndDescription(source.MythicActions),

    id: "",
    user_id: "",
    is_public: false,
    environment_id: "",
  };
}

export function toImprovedInitiative(
  source: typeof defaultCreature
): typeof ImprovedInitiativeCreature {
  // Convert movements to speed array
  const speedEntries = [];
  if (source.movements.walk > 0)
    speedEntries.push(`walk ${source.movements.walk} ft.`);
  if (source.movements.climb > 0)
    speedEntries.push(`climb ${source.movements.climb} ft.`);
  if (source.movements.fly > 0)
    speedEntries.push(`fly ${source.movements.fly} ft.`);
  if (source.movements.swim > 0)
    speedEntries.push(`swim ${source.movements.swim} ft.`);
  if (source.movements.burrow > 0)
    speedEntries.push(`burrow ${source.movements.burrow} ft.`);

  // Convert senses to array
  const senses = [];
  if (source.senses.blindsight > 0)
    senses.push(`blindsight ${source.senses.blindsight} ft.`);
  if (source.senses.darkvision > 0)
    senses.push(`darkvision ${source.senses.darkvision} ft.`);
  if (source.senses.tremorsense > 0)
    senses.push(`tremorsense ${source.senses.tremorsense} ft.`);
  if (source.senses.truesight > 0)
    senses.push(`truesight ${source.senses.truesight} ft.`);
  senses.push(`passive Perception ${source.passive_perception}`);

  const savingThrows = source.saving_throws.map((score) => {
    const ability =
      source.ability_scores[score as keyof typeof source.ability_scores];
    return {
      Name: titleCase(score),
      Modifier: calculateStatBonus(ability) + source.cr.proficiency_bonus,
    };
  });

  const skillSaves = source.skill_bonuses.map((skl) => {
    const bonus = Math.floor(
      source.ability_scores[
        skl.skill_modifier as keyof typeof source.ability_scores
      ] /
        2 -
        5
    );
    const profBonus = skl.is_expert
      ? (source.cr.proficiency_bonus || 1) * 2
      : source.cr.proficiency_bonus || 0;
    return {
      Name: titleCase(skl.skill_name),
      Modifier: profBonus + (bonus >= 0 ? bonus : 0),
    };
  });
  return {
    Source: "Monsterbrew",
    Type: `${source.size} ${source.type}, ${source.alignment}`,
    HP: {
      Value: parseInt(source.hit_points) || 1,
      Notes: source.hit_dice,
    },
    AC: {
      Value: parseInt(source.armor_class) || 10,
      Notes: source.armor_description ?? "",
    },
    InitiativeModifier: 0,
    InitiativeAdvantage: false,
    Speed: speedEntries,
    Abilities: {
      Str: source.ability_scores.str,
      Dex: source.ability_scores.dex,
      Con: source.ability_scores.con,
      Int: source.ability_scores.int,
      Wis: source.ability_scores.wis,
      Cha: source.ability_scores.cha,
    },
    DamageVulnerabilities: source.damage_vulnerabilities,
    DamageResistances: source.damage_resistances,
    DamageImmunities: source.damage_immunities,
    ConditionImmunities: source.condition_immunities,
    Saves: savingThrows,
    Skills: skillSaves,
    Senses: senses,
    Languages: source.languages.map((l) => l.toString()),
    Challenge: source.cr.challenge_rating,
    Traits: source.traits.map((t) => ({
      Name: t.name,
      Content: t.description,
    })),
    Actions: source.actions.map((a) => ({
      Name: a.name,
      Content: a.description,
    })),
    Reactions: source.reactions.map((r) => ({
      Name: r.name,
      Content: r.description,
    })),
    LegendaryActions: source.legendary_actions.map((la) => ({
      Name: la.name,
      Content: la.description,
    })),
    BonusActions: [],
    MythicActions: [],
    Description: source.name,
    Player: source.user_id,
    Version: "",
    ImageURL: "",
  };
}

function convertToNameAndDescription(
  actions: { Name: string; Content: string }[]
) {
  return actions.map((a) => ({ name: a.Name, description: a.Content }));
}
