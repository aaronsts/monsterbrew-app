import { z } from "zod";
import { Languages } from "@/schema/createCreatureSchema";

export const languagesSchema = z.nativeEnum(Languages);

export const abilityScoresSchema = z.object({
  str: z.coerce.number(),
  dex: z.coerce.number(),
  con: z.coerce.number(),
  int: z.coerce.number(),
  wis: z.coerce.number(),
  cha: z.coerce.number(),
});

export const movementSchema = z.object({
  walk: z.coerce.number(),
  swim: z.coerce.number(),
  burrow: z.coerce.number(),
  climb: z.coerce.number(),
  fly: z.coerce.number(),
  hover: z.boolean(),
});

export const sensesSchema = z.object({
  blindsight: z.coerce.number(),
  darkvision: z.coerce.number(),
  tremorsense: z.coerce.number(),
  truesight: z.coerce.number(),
  is_blind_beyond: z.boolean(),
});

export const challengeRatingSchema = z.object({
  challenge_rating: z.string(),
  proficiency_bonus: z.coerce.number(),
  hit_points_range: z.string(),
  attack_bonus: z.coerce.number(),
  damage_per_round: z.string(),
  save_dc: z.coerce.number(),
  experience: z.coerce.number(),
  armor_class: z.coerce.number(),
});

export const savingThrowsSchema = z.object({
  str: z.boolean().optional(),
  dex: z.boolean().optional(),
  con: z.boolean().optional(),
  int: z.boolean().optional(),
  wis: z.boolean().optional(),
  cha: z.boolean().optional(),
});

export const featureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const monsterSchema = z.object({
  // Identity
  name: z.string(),
  type: z.string(),
  size: z.string(),
  sub_type: z.string(),
  alignment: z.string().optional(),
  description: z.string().optional(),
  senses: sensesSchema,
  languages: z.array(languagesSchema),
  passive_perception: z.coerce.number(),
  custom_passive_perception: z.boolean().optional(),

  // Combat
  cr: challengeRatingSchema,
  armor_class: z.coerce.number(),
  armor_description: z.string().optional(),
  hit_points: z.string(),
  hit_dice: z.string(),
  custom_hp: z.boolean(),
  ability_scores: abilityScoresSchema,
  movements: movementSchema,

  // Defense
  saving_throws: savingThrowsSchema,
  skills: z.record(z.string(), z.enum(["proficient", "expert"])).optional(),
  damage_modifiers: z
    .record(z.string(), z.enum(["resistant", "vulnerable", "immune"]))
    .optional(),
  nonmagical_attack_immunity: z.boolean().optional(),
  nonmagical_attack_resistance: z.boolean().optional(),
  condition_immunities: z.array(z.string()),

  // Actions
  traits: z.array(featureSchema),
  actions: z.array(featureSchema),
  reactions: z.array(featureSchema),
  bonus_actions: z.array(featureSchema),

  has_lair: z.boolean(),
  lair_description: z.string(),
  lair_actions: z.array(featureSchema),

  is_legendary: z.boolean(),
  legendary_description: z.string(),
  legendary_actions: z.array(featureSchema),

  is_mythic: z.boolean(),
  mythic_description: z.string(),
  mythic_actions: z.array(featureSchema),
});

export type Monster = z.infer<typeof monsterSchema>;

export const defaultMonster: Monster = {
  // Identity
  name: "",
  type: "",
  size: "",
  sub_type: "",
  alignment: "",
  description: "",
  senses: {
    blindsight: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: false,
  },
  languages: [],
  passive_perception: 0,
  custom_passive_perception: false,

  // Combat
  cr: {
    challenge_rating: "0",
    proficiency_bonus: 2,
    hit_points_range: "1 - 6",
    attack_bonus: 3,
    damage_per_round: "0 - 1 ",
    save_dc: 13,
    experience: 10,
    armor_class: 13,
  },
  armor_class: 0,
  armor_description: "",
  hit_points: "",
  hit_dice: "",
  custom_hp: false,
  ability_scores: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  },
  movements: {
    walk: 0,
    swim: 0,
    burrow: 0,
    climb: 0,
    fly: 0,
    hover: false,
  },

  // Defense
  saving_throws: {},
  skills: {},
  damage_modifiers: {},
  nonmagical_attack_immunity: false,
  nonmagical_attack_resistance: false,
  condition_immunities: [],

  // Actions
  traits: [],
  actions: [],
  reactions: [],
  bonus_actions: [],

  has_lair: false,
  lair_description: "",
  lair_actions: [],

  is_legendary: false,
  legendary_description: "",
  legendary_actions: [],

  is_mythic: false,
  mythic_description: "",
  mythic_actions: [],
};
