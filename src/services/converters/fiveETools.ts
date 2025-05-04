import { CHALLENGE_RATINGS } from "@/lib/constants";
import {
  createCreatureSchema,
  defaultCreature,
  Languages,
} from "@/schema/createCreatureSchema";
import { fiveECreatureSchema } from "@/types/fiveETools";
import { toast } from "sonner";
import { z } from "zod";

// Converter function to transform FiveEToolsCreature to defaultCreature
export function from5ETools(
  source: z.infer<typeof fiveECreatureSchema>
): z.infer<typeof createCreatureSchema> {
  try {
    const cr = convertChallengeRating(source.cr);
    const skills = convertSkills(source.skill, cr.proficiency_bonus);

    return {
      name: source.name || "",
      size: convertSize(source.size),
      type: extractType(source.type),
      alignment: convertAlignment(source.alignment),
      armor_class: source.ac ? source.ac[0]?.toString() : "",
      armor_description: "",
      hit_dice:
        source.hp && "formula" in source.hp
          ? source.hp?.formula?.split("d")[0]
          : "",
      hit_points:
        source.hp && "average" in source.hp
          ? source.hp?.average?.toString()
          : "",
      custom_hp: false,
      movements:
        source.speed && "special" in source.speed
          ? { walk: 30, swim: 0, burrow: 0, climb: 0, fly: 0, hover: false }
          : {
              walk: Number(source.speed?.walk) || 0,
              swim: Number(source.speed?.swim) || 0,
              burrow: Number(source.speed?.burrow) || 0,
              climb: Number(source.speed?.climb) || 0,
              fly: Number(source.speed?.fly) || 0,
              hover: Boolean(source.speed?.canHover) || false,
            },
      ability_scores: {
        str: typeof source?.str === "number" ? source.str : 10,
        dex: typeof source?.dex === "number" ? source.dex : 10,
        con: typeof source?.con === "number" ? source.con : 10,
        int: typeof source?.int === "number" ? source.int : 10,
        wis: typeof source?.wis === "number" ? source.wis : 10,
        cha: typeof source?.cha === "number" ? source.cha : 10,
      },
      saving_throws: (source.save && Object.keys(source.save)) || [],
      nonmagical_attack_immunity: false,
      nonmagical_attack_resistance: false,
      damage_immunities: source.immune
        ? source.immune.flatMap((item) =>
            typeof item === "string" ? item : item.immune || []
          )
        : [],
      condition_immunities: source.conditionImmune
        ? source.conditionImmune.flatMap((item) =>
            typeof item === "string" ? item : item.conditionImmune || []
          )
        : [],
      damage_resistances: source.resist
        ? source.resist.flatMap((item) =>
            typeof item === "string" ? item : item.resist || []
          )
        : [],
      damage_vulnerabilities: source.vulnerable
        ? source.vulnerable.flatMap((item) =>
            typeof item === "string" ? item : item.vulnerable || []
          )
        : [],
      skill_bonuses: skills,
      languages: (source.languages as Languages[]) || [],
      passive_perception: Number(source.passive) || 0,
      senses: parseSenses(source.senses),
      cr: cr,
      traits: convertTraits(source),
      actions: convertActions(source.action),
      reactions: convertActions(source.reaction),

      is_legendary: Boolean(source.legendary),
      legendary_description: getLegendaryDescription(source),
      legendary_actions: convertLegendaryActions(source.legendary),

      is_mythic: Boolean(source.mythic),
      mythic_description: getMythicDescription(source),
      mythic_actions: convertMythivActions(source.mythic),

      environment_id: convertEnvironment(source.environment),
      user_id: "",
    };
  } catch (error) {
    // Throw a more descriptive error
    if (error instanceof Error) {
      toast.error(`Failed to convert creature: ${error.message}`);
    }
    toast.error("Failed to convert creature due to an unknown error");
    return defaultCreature;
  }
}

// Helper functions for conversion

function extractType(
  typeInfo: z.infer<typeof fiveECreatureSchema>["type"]
): string {
  if (typeof typeInfo === "string") {
    return typeInfo;
  } else if (typeInfo && typeof typeInfo === "object") {
    if (
      typeof typeInfo.type === "object" &&
      Array.isArray(typeInfo.type.choose)
    ) {
      return typeInfo.type.choose[0] || "";
    }
    return typeof typeInfo.type === "string" ? typeInfo.type : "";
  }
  return "";
}

function convertSize(sizes: string[] | undefined): string {
  if (!sizes || sizes.length === 0) {
    throw new Error("Size information is missing");
  }

  // Map 5eTools size format to the expected format in defaultCreature
  const sizeMap: Record<string, string> = {
    T: "tiny",
    S: "small",
    M: "medium",
    L: "large",
    H: "huge",
    G: "gargantuan",
  };

  return sizeMap[sizes[0]] || sizes[0];
}

function convertAlignment(
  alignment: z.infer<typeof fiveECreatureSchema>["alignment"]
): string {
  if (!alignment || alignment.length === 0) {
    return "Unaligned";
  }

  // Map abbreviations to full alignment names
  const alignmentMap: Record<string, string> = {
    L: "Lawful",
    N: "Neutral",
    C: "Chaotic",
    G: "Good",
    E: "Evil",
    NX: "Neutral", // For explicitly neutral
    NY: "Neutral", // For explicitly neutral
  };

  // Handle special case for unaligned
  if (alignment.includes("U")) {
    return "Unaligned";
  }

  // Handle special case for any alignment
  if (alignment.includes("A")) {
    return "Any Alignment";
  }

  if (alignment.length === 1) {
    // If only one alignment value is provided
    return typeof alignment[0] === "string"
      ? alignmentMap[alignment[0] as string] || alignment[0]
      : "Neutral";
  } else if (alignment.length === 2) {
    // For normal combinations like Lawful Good
    return `${
      typeof alignment[0] === "string"
        ? alignmentMap[alignment[0] as string] || alignment[0]
        : "Neutral"
    } ${
      typeof alignment[1] === "string"
        ? alignmentMap[alignment[1] as string] || alignment[1]
        : "Neutral"
    }`;
  }

  return alignment.join(" ");
}

function convertSkills(
  skills: z.infer<typeof fiveECreatureSchema>["skill"],
  proficiencyBonus: number
): Array<{
  skill_name: string;
  skill_modifier: string;
  is_expert?: boolean | undefined;
  is_proficient?: boolean | undefined;
}> {
  if (!skills) return [];

  const result = [];
  for (const [skill, bonus] of Object.entries(skills)) {
    const isExpert = parseInt(bonus) >= proficiencyBonus * 2;
    isExpert
      ? result.push({
          skill_name: skill,
          skill_modifier: bonus,
          is_expert: true,
        })
      : result.push({
          skill_name: skill,
          skill_modifier: bonus,
          is_proficient: true,
        });
  }

  return result;
}

function parseSenses(senses: z.infer<typeof fiveECreatureSchema>["senses"]): {
  blindsight: number;
  darkvision: number;
  tremorsense: number;
  truesight: number;
  is_blind_beyond: boolean;
} {
  const result = {
    blindsight: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: false,
  };

  if (!senses || !Array.isArray(senses)) return result;

  for (const sense of senses) {
    // Parse blindsight
    const blindsightMatch = sense.match(/blindsight (\d+) ft/);
    if (blindsightMatch) {
      result.blindsight = parseInt(blindsightMatch[1]);

      // Check if blind beyond
      if (sense.includes("blind beyond")) {
        result.is_blind_beyond = true;
      }
    }

    // Parse darkvision
    const darkvisionMatch = sense.match(/darkvision (\d+) ft/);
    if (darkvisionMatch) {
      result.darkvision = parseInt(darkvisionMatch[1]);
    }

    // Parse tremorsense
    const tremorsenseMatch = sense.match(/tremorsense (\d+) ft/);
    if (tremorsenseMatch) {
      result.tremorsense = parseInt(tremorsenseMatch[1]);
    }

    // Parse truesight
    const truesightMatch = sense.match(/truesight (\d+) ft/);
    if (truesightMatch) {
      result.truesight = parseInt(truesightMatch[1]);
    }
  }

  return result;
}

function extractCR(cr: z.infer<typeof fiveECreatureSchema>["cr"]): string {
  if (typeof cr === "string") {
    return cr;
  }

  if (typeof cr === "object" && cr.cr) {
    return cr.cr.toString();
  }

  throw new Error("Challenge rating is missing or in an unexpected format");
}

function convertChallengeRating(
  crString: z.infer<typeof fiveECreatureSchema>["cr"]
): (typeof CHALLENGE_RATINGS)[number] {
  if (!crString) {
    throw new Error("Challenge rating is missing");
  }

  const cr = extractCR(crString);

  const foundCR =
    CHALLENGE_RATINGS.find((c) => c.challenge_rating === cr) ??
    CHALLENGE_RATINGS[0];

  return foundCR;
}

function convertTraits(
  creature: z.infer<typeof fiveECreatureSchema>
): z.infer<typeof createCreatureSchema>["traits"] {
  const traits: Array<{ name: string; description: string }> = [];

  // Convert regular traits
  if (creature.trait && Array.isArray(creature.trait)) {
    for (const trait of creature.trait) {
      traits.push({
        name: trait.name,
        description: Array.isArray(trait.entries)
          ? trait.entries.join("\n")
          : trait.entries,
      });
    }
  }

  // Convert spellcasting into traits
  if (creature.spellcasting && creature.spellcasting.length > 0) {
    for (const spellcasting of creature.spellcasting) {
      if (
        spellcasting.type === "spellcasting" &&
        spellcasting.displayAs !== "action" &&
        spellcasting.displayAs !== "reaction"
      ) {
        const name = spellcasting.name || "Spellcasting";

        // Combine all entries into a description
        let description = "";

        if (spellcasting.headerEntries) {
          description += spellcasting.headerEntries.join("\n") + "\n";
        }

        // Add cantrips/will spells
        if (spellcasting.will && spellcasting.will.length > 0) {
          description += "At will: " + spellcasting.will.join(", ") + "\n";
        }

        // Add daily spells
        if (spellcasting.daily) {
          for (const [times, spells] of Object.entries(spellcasting.daily)) {
            description += `${times}/day: ${(spells as string[]).join(", ")}\n`;
          }
        }

        traits.push({
          name,
          description: description.trim(),
        });
      }
    }
  }

  return traits;
}

function convertActions(
  actions: z.infer<typeof fiveECreatureSchema>["action"]
): z.infer<typeof createCreatureSchema>["actions"] {
  if (!actions) return [];

  const convertedActions = [];

  for (const action of actions) {
    convertedActions.push({
      name: action.name,
      description: Array.isArray(action.entries)
        ? action.entries.join("\n")
        : action.entries,
    });
  }

  return convertedActions;
}

function getLegendaryDescription(
  creature: z.infer<typeof fiveECreatureSchema>
): string {
  // Check if there's a dedicated legendary description
  if (creature.legendaryHeader) {
    return Array.isArray(creature.legendaryHeader)
      ? creature.legendaryHeader.join("\n")
      : creature.legendaryHeader;
  }

  // Default legendary description
  if (creature.legendary) {
    return `The ${creature.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${creature.name} regains spent legendary actions at the start of its turn.`;
  }

  return "";
}

function getMythicDescription(
  creature: z.infer<typeof fiveECreatureSchema>
): string {
  // Check if there's a dedicated legendary description
  if (creature.mythic && creature.mythicHeader) {
    return Array.isArray(creature.mythicHeader)
      ? creature.mythicHeader.join("\n")
      : creature.mythicHeader;
  }

  return "";
}

function convertLegendaryActions(
  legendary: z.infer<typeof fiveECreatureSchema>["legendary"]
): z.infer<typeof createCreatureSchema>["legendary_actions"] {
  if (!legendary || !Array.isArray(legendary)) return [];

  return legendary.map((item, i) => ({
    name: item.name || `Legendary Action ${i}`,
    description: Array.isArray(item.entries)
      ? item.entries.join("\n")
      : item.entries,
  }));
}

function convertMythivActions(
  mythic: z.infer<typeof fiveECreatureSchema>["mythic"]
): z.infer<typeof createCreatureSchema>["mythic_actions"] {
  if (!mythic || !Array.isArray(mythic)) return [];

  return mythic.map((item, i) => ({
    name: item.name || `Mythic Action ${i}`,
    description: Array.isArray(item.entries)
      ? item.entries.join("\n")
      : item.entries,
  }));
}

function convertEnvironment(environment: string[] | undefined): string {
  if (!environment || environment.length === 0) return "";

  // In a real implementation, you would map environment IDs to your system's environment IDs
  // This is a simplified implementation that returns the first environment
  return environment[0];
}
