import { CHALLENGE_RATINGS } from "@/lib/constants";
import { defaultCreature, Languages } from "@/schema/createCreatureSchema";
import { toast } from "sonner";

// Converter function to transform FiveEToolsCreature to defaultCreature
export function from5ETools(
  fiveEToolsCreature: typeof FiveEToolsCreature
): typeof defaultCreature {
  try {
    // Create a new defaultCreature object with converted values
    const convertedCreature = {
      name: fiveEToolsCreature.name || "",
      size: convertSize(fiveEToolsCreature.size),
      type: extractType(fiveEToolsCreature.type),
      alignment: convertAlignment(fiveEToolsCreature.alignment),
      armor_class: fiveEToolsCreature.ac[0]?.toString() || "",
      armor_description: "",
      hit_dice: fiveEToolsCreature.hp.formula.split("d")[0] || "",
      hit_points: fiveEToolsCreature.hp.average?.toString() || "",
      custom_hp: false,
      movements: {
        walk: fiveEToolsCreature.speed.walk || 0,
        swim: fiveEToolsCreature.speed.swim || 0,
        burrow: fiveEToolsCreature.speed.burrow || 0,
        climb: fiveEToolsCreature.speed.climb || 0,
        fly: fiveEToolsCreature.speed.fly || 0,
        hover: Boolean(fiveEToolsCreature.speed.canHover) || false,
      },
      ability_scores: {
        str: fiveEToolsCreature.str || 10,
        dex: fiveEToolsCreature.dex || 10,
        con: fiveEToolsCreature.con || 10,
        int: fiveEToolsCreature.int || 10,
        wis: fiveEToolsCreature.wis || 10,
        cha: fiveEToolsCreature.cha || 10,
      },
      saving_throws: Object.keys(fiveEToolsCreature.save),
      nonmagical_attack_immunity: false,
      nonmagical_attack_resistance: false,
      damage_immunities: fiveEToolsCreature.immune || [],
      condition_immunities: fiveEToolsCreature.conditionImmune || [],
      damage_resistances: fiveEToolsCreature.resist || [],
      damage_vulnerabilities: fiveEToolsCreature.vulnerable || [],
      skill_bonuses: convertSkills(fiveEToolsCreature.skill),
      languages: (fiveEToolsCreature.languages as Languages[]) || [],
      passive_perception: fiveEToolsCreature.passive || 0,
      senses: parseSenses(fiveEToolsCreature.senses),
      cr: convertChallengeRating(fiveEToolsCreature.cr),
      traits: convertTraits(fiveEToolsCreature),
      actions: convertActions(fiveEToolsCreature.action),
      reactions: convertReactions(fiveEToolsCreature),
      is_legendary: Boolean(fiveEToolsCreature.legendary),
      legendary_description: getLegendaryDescription(fiveEToolsCreature),
      legendary_actions: convertLegendaryActions(fiveEToolsCreature.legendary),
      environment_id: convertEnvironment(fiveEToolsCreature.environment),
      user_id: "",
    };

    return { ...convertedCreature };
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

function extractType(typeInfo: { type: string } | string): string {
  if (typeof typeInfo === "string") {
    return typeInfo;
  }

  if (typeInfo && typeof typeInfo === "object") {
    return typeInfo.type;
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

function convertAlignment(alignment: string[] | undefined): string {
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
    return alignmentMap[alignment[0]] || alignment[0];
  } else if (alignment.length === 2) {
    // For normal combinations like Lawful Good
    return `${alignmentMap[alignment[0]] || alignment[0]} ${
      alignmentMap[alignment[1]] || alignment[1]
    }`;
  }

  return alignment.join(" ");
}

function convertSkills(skills: Record<string, string> | undefined): Array<{
  skill_name: string;
  skill_modifier: string;
  is_expert?: boolean | undefined;
  is_proficient?: boolean | undefined;
}> {
  if (!skills) return [];

  const result = [];
  for (const [skill, bonus] of Object.entries(skills)) {
    // TODO: check if expert or proficient
    result.push({
      skill_name: skill,
      skill_modifier: bonus,
    });
  }

  return result;
}

function parseSenses(senses: string[] | undefined): {
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

function extractCR(cr: { cr: string; xpLair: number } | string): string {
  if (typeof cr === "string") {
    return cr;
  }

  if (typeof cr === "object" && cr.cr) {
    return cr.cr.toString();
  }

  throw new Error("Challenge rating is missing or in an unexpected format");
}

function convertChallengeRating(
  crString: { cr: string; xpLair: number } | string
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
  creature: typeof FiveEToolsCreature
): Array<{ name: string; description: string }> {
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
            description += `${times}/day: ${spells.join(", ")}\n`;
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
  actions: Array<{ name: string; entries: string[] }> | undefined
): Array<{ name: string; description: string }> {
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

function convertReactions(
  creature: any
): Array<{ name: string; description: string }> {
  const reactions: Array<{ name: string; description: string }> = [];

  // Convert explicit reactions
  if (creature.reaction && Array.isArray(creature.reaction)) {
    for (const reaction of creature.reaction) {
      reactions.push({
        name: reaction.name,
        description: Array.isArray(reaction.entries)
          ? reaction.entries.join("\n")
          : reaction.entries,
      });
    }
  }

  // Convert reaction-type spellcasting
  if (creature.spellcasting && creature.spellcasting.length > 0) {
    for (const spellcasting of creature.spellcasting) {
      if (spellcasting.displayAs === "reaction") {
        const name = spellcasting.name || "Reaction Spellcasting";

        // Combine all entries into a description
        let description = "";

        if (spellcasting.headerEntries) {
          description += spellcasting.headerEntries.join("\n");
        }

        reactions.push({
          name,
          description: description.trim(),
        });
      }
    }
  }

  return reactions;
}

function getLegendaryDescription(creature: any): string {
  // Check if there's a dedicated legendary description
  if (creature.legendary && creature.legendary.headerEntries) {
    return Array.isArray(creature.legendary.headerEntries)
      ? creature.legendary.headerEntries.join("\n")
      : creature.legendary.headerEntries;
  }

  // Default legendary description
  if (creature.legendary) {
    return `The ${creature.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${creature.name} regains spent legendary actions at the start of its turn.`;
  }

  return "";
}

function convertLegendaryActions(
  legendary: any[] | undefined
): Array<{ name: string; description: string }> {
  if (!legendary || !Array.isArray(legendary)) return [];

  return legendary.map((item) => ({
    name: item.name,
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
