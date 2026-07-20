import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { abilityScoresSchema, Monster } from "@/schema/monster-schema";
import { partitionLanguages } from "@/lib/utils";

type LegacyCreature = z.infer<typeof createCreatureSchema>;

export type StoredMonster = Monster & { id: string; is_public?: boolean };

const ABILITY_KEYS = abilityScoresSchema.keyof().options;

/** Mirrors `generateUniqueId()` in `src/components/save-dialog.tsx`. */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function creatureToMonster(creature: LegacyCreature): StoredMonster {
  // saving_throws: ["str", "dex", …] -> { str: true, dex: true, … }
  const saving_throws: Monster["saving_throws"] = {};
  const savingThrowsList = creature.saving_throws ?? [];
  for (const ability of ABILITY_KEYS) {
    if (savingThrowsList.includes(ability)) {
      saving_throws[ability] = true;
    }
  }

  // skill_bonuses[] -> { [skill_name]: "proficient" | "expert" }; expert wins.
  const skills: NonNullable<Monster["skills"]> = {};
  for (const bonus of creature.skill_bonuses ?? []) {
    if (bonus.is_expert) {
      skills[bonus.skill_name] = "expert";
    } else if (bonus.is_proficient) {
      skills[bonus.skill_name] = "proficient";
    }
  }

  const { languages, custom_languages } = partitionLanguages(
    (creature.languages ?? []) as unknown as string[],
  );

  const damage_modifiers: NonNullable<Monster["damage_modifiers"]> = {};
  for (const type of creature.damage_vulnerabilities ?? []) {
    damage_modifiers[type] = "vulnerable";
  }
  for (const type of creature.damage_resistances ?? []) {
    damage_modifiers[type] = "resistant";
  }
  for (const type of creature.damage_immunities ?? []) {
    damage_modifiers[type] = "immune";
  }

  return {
    id: creature.id && creature.id.length > 0 ? creature.id : generateId(),
    is_public: creature.is_public,

    // Identity
    name: creature.name,
    type: creature.type,
    size: creature.size,
    sub_type: creature.sub_type,
    alignment: creature.alignment,
    description: creature.description ?? undefined,
    senses: creature.senses,
    languages,
    custom_languages,
    passive_perception: creature.passive_perception,
    custom_passive_perception: creature.custom_passive_perception,

    // Combat
    cr: creature.cr,
    armor_class: creature.armor_class,
    armor_description: creature.armor_description,
    hit_points: creature.hit_points,
    hit_dice: creature.hit_dice,
    custom_hp: creature.custom_hp,
    ability_scores: creature.ability_scores,
    movements: creature.movements,

    // Defense
    saving_throws,
    skills,
    damage_modifiers,
    nonmagical_attack_immunity: creature.nonmagical_attack_immunity,
    nonmagical_attack_resistance: creature.nonmagical_attack_resistance,
    condition_immunities: creature.condition_immunities ?? [],

    // Actions
    traits: creature.traits ?? [],
    actions: creature.actions ?? [],
    reactions: creature.reactions ?? [],
    bonus_actions: [],

    has_lair: false,
    lair_description: "",
    lair_actions: [],

    is_legendary: creature.is_legendary,
    legendary_description: creature.legendary_description,
    legendary_actions: creature.legendary_actions ?? [],

    is_mythic: creature.is_mythic,
    mythic_description: creature.mythic_description,
    mythic_actions: creature.mythic_actions ?? [],
  };
}
