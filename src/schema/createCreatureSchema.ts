import { z } from "zod";

export const jsonSchema: z.ZodSchema = z.lazy(() =>
  z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.record(z.union([jsonSchema, z.undefined()])),
      z.array(jsonSchema),
    ])
    .nullable()
);

export const damageTypesSchema = z.union([
  z.literal("acid"),
  z.literal("bludgeoning"),
  z.literal("cold"),
  z.literal("fire"),
  z.literal("force"),
  z.literal("lightning"),
  z.literal("necrotic"),
  z.literal("piercing"),
  z.literal("poison"),
  z.literal("psychic"),
  z.literal("radiant"),
  z.literal("slashing"),
  z.literal("thunder"),
]);

export enum Languages {
  "abyssal" = "abyssal",
  "celestial" = "celestial",
  "common" = "common",
  "deep-speech" = "deep-speech",
  "draconic" = "draconic",
  "druidic" = "druidic",
  "dwarvish" = "dwarvish",
  "elvish" = "elvish",
  "giant" = "giant",
  "gnomish" = "gnomish",
  "goblin" = "goblin",
  "halfling" = "halfling",
  "infernal" = "infernal",
  "orc" = "orc",
  "primordial" = "primordial",
  "sylvan" = "sylvan",
  "thieves-cant" = "thieves-cant",
  "undercommon" = "undercommon",
}

export const languagesSchema = z.nativeEnum(Languages);

export const movementSchema = z.object({
  burrow: z.coerce.number(),
  climb: z.coerce.number(),
  fly: z.coerce.number(),
  hover: z.boolean(),
  swim: z.coerce.number(),
  walk: z.coerce.number(),
});

export const abilityScoresSchema = z.object({
  str: z.coerce.number(),
  dex: z.coerce.number(),
  con: z.coerce.number(),
  int: z.coerce.number(),
  wis: z.coerce.number(),
  cha: z.coerce.number(),
});

export const sensesSchema = z.object({
  blindsight: z.coerce.number(),
  darkvision: z.coerce.number(),
  is_blind_beyond: z.boolean(),
  tremorsense: z.coerce.number(),
  truesight: z.coerce.number(),
});

export const skillsBonusSchema = z.array(
  z.object({
    is_expert: z.boolean().optional(),
    is_proficient: z.boolean().optional(),
    skill_modifier: z.string(),
    skill_name: z.string(),
  })
);

export const createCreatureSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.string(),
  alignment: z.string().optional(),
  armor_class: z.number(),
  armor_description: z.string().optional(),
  custom_hp: z.boolean(),
  cr: z.object({
    challenge_rating: z.string(),
    proficiency_bonus: z.coerce.number(),
    hit_points_range: z.string(),
    attack_bonus: z.coerce.number(),
    damage_per_round: z.string(),
    save_dc: z.coerce.number(),
    experience: z.coerce.number(),
    armor_class: z.coerce.number(),
  }),

  movements: movementSchema,
  ability_scores: abilityScoresSchema,
  senses: sensesSchema,
  languages: z.array(languagesSchema),
  saving_throws: z.array(z.string()),
  condition_immunities: z.array(z.string()),
  skill_bonuses: skillsBonusSchema,
  damage_immunities: z.array(z.string()),
  damage_resistances: z.array(z.string()),
  damage_vulnerabilities: z.array(z.string()),
  description: z.string().optional().nullable(),
  environment_id: z.string().optional().nullable(),
  hit_dice: z.string(),
  hit_points: z.string(),
  id: z.string().optional(),
  is_public: z.boolean().optional(),

  traits: z.array(z.object({ name: z.string(), description: z.string() })),
  actions: z.array(z.object({ name: z.string(), description: z.string() })),
  reactions: z.array(z.object({ name: z.string(), description: z.string() })),

  is_legendary: z.boolean(),
  legendary_description: z.string(),
  legendary_actions: z.array(
    z.object({ name: z.string(), description: z.string() })
  ),

  is_mythic: z.boolean(),
  mythic_description: z.string(),
  mythic_actions: z.array(
    z.object({ name: z.string(), description: z.string() })
  ),

  nonmagical_attack_immunity: z.boolean().optional(),
  nonmagical_attack_resistance: z.boolean().optional(),
  passive_perception: z.number(),
  custom_passive_perception: z.boolean().optional(),
  user_id: z.string(),
});

export const defaultCreature: z.infer<typeof createCreatureSchema> = {
  name: "",
  size: "",
  type: "",
  alignment: "",

  armor_class: 0,
  armor_description: "",
  hit_dice: "",
  hit_points: "",
  custom_hp: false,

  movements: {
    walk: 0,
    swim: 0,
    burrow: 0,
    climb: 0,
    fly: 0,
    hover: false,
  },

  ability_scores: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  },
  saving_throws: [],

  nonmagical_attack_immunity: false,
  nonmagical_attack_resistance: false,
  damage_immunities: [],
  condition_immunities: [],
  damage_resistances: [],
  damage_vulnerabilities: [],
  skill_bonuses: [],
  languages: [],
  passive_perception: 0,
  custom_passive_perception: false,
  senses: {
    blindsight: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: false,
  },

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

  traits: [],

  actions: [],
  reactions: [],

  is_legendary: false,
  legendary_description: "",
  legendary_actions: [],

  is_mythic: false,
  mythic_description: "",
  mythic_actions: [],

  id: "",
  user_id: "",
  is_public: false,
  environment_id: "",
};
