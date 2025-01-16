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
  burrow: z.coerce.number().optional(),
  climb: z.coerce.number().optional(),
  crawl: z.coerce.number().optional(),
  fly: z.coerce.number().optional(),
  hover: z.boolean().optional(),
  swim: z.coerce.number().optional(),
  walk: z.coerce.number().optional(),
});

export const abilityScoresSchema = z.object({
  strength: z.coerce.number(),
  dexterity: z.coerce.number(),
  constitution: z.coerce.number(),
  intelligence: z.coerce.number(),
  wisdom: z.coerce.number(),
  charisma: z.coerce.number(),
});

export const sensesSchema = z.object({
  blindsight: z.number().optional(),
  darkvision: z.number().optional(),
  is_blind_beyond: z.boolean().optional(),
  tremor_sense: z.number().optional(),
  true_sight: z.number().optional(),
});

export const skillsBonusSchema = z.array(
  z.object({
    is_expert: z.boolean().optional(),
    is_proficient: z.boolean().optional(),
    skill_modifier: z.coerce.number(),
    skill_name: z.string(),
  })
);

export const createCreatureSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.string(),
  alignment: z.string().optional(),
  armor_class: z.coerce.number(),
  armor_description: z.string().optional(),
  challenge_rating: z.string(),
  actions: z.array(jsonSchema).optional(),
  movements: movementSchema,
  ability_scores: abilityScoresSchema,
  senses: sensesSchema.optional(),
  languages: languagesSchema.optional(),
  saving_throws: jsonSchema.optional(),
  skill_bonuses: skillsBonusSchema,
  damage_immunities: z.array(z.string()).optional(),
  damage_resistances: damageTypesSchema.optional().nullable(),
  damage_vulnerabilities: damageTypesSchema.optional().nullable(),
  description: z.string().optional().nullable(),
  environment_id: z.string().optional().nullable(),
  hit_dice: z.string(),
  hit_points: z.number().optional().nullable(),
  id: z.string().optional(),
  is_public: z.boolean().optional(),
  key: z.string(),
  nonmagical_attack_immunity: z.boolean().optional(),
  nonmagical_attack_resistance: z.boolean().optional(),
  passive_perception: z.number().optional(),
  user_id: z.string(),
});

export const defaultCreature: z.infer<typeof createCreatureSchema> = {
  name: "",
  alignment: "",
  size: "",
  type: "",
  ability_scores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    wisdom: 10,
    intelligence: 10,
    charisma: 10,
  },
  movements: {
    walk: 0,
    swim: 0,
    burrow: 0,
    climb: 0,
    fly: 0,
    hover: false,
  },
  damage_immunities: [],
};
