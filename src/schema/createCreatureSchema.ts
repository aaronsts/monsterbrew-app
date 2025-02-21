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
  str: z.coerce.number(),
  dex: z.coerce.number(),
  con: z.coerce.number(),
  int: z.coerce.number(),
  wis: z.coerce.number(),
  cha: z.coerce.number(),
});

export const sensesSchema = z.object({
  blindsight: z.coerce.number().optional(),
  darkvision: z.coerce.number().optional(),
  is_blind_beyond: z.boolean().optional(),
  tremorsense: z.coerce.number().optional(),
  truesight: z.coerce.number().optional(),
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
  armor_class: z.string(),
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
  traits: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  actions: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  legendary_actions: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  legendary_description: z.string(),
  reactions: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  movements: movementSchema,
  ability_scores: abilityScoresSchema,
  senses: sensesSchema.optional(),
  languages: z.array(languagesSchema.optional()),
  saving_throws: jsonSchema.optional(),
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
  key: z.string(),
  nonmagical_attack_immunity: z.boolean().optional(),
  nonmagical_attack_resistance: z.boolean().optional(),
  passive_perception: z.number().optional(),
  user_id: z.string(),
});

export const defaultCreature: z.infer<typeof createCreatureSchema> = {
  name: "",
  armor_class: "",
  armor_description: "",
  skill_bonuses: [],
  id: "",
  is_public: false,
  cr: {
    challenge_rating: "24",
    proficiency_bonus: 7,
    hit_points_range: "536 - 580",
    attack_bonus: 12,
    damage_per_round: "195 - 212",
    save_dc: 21,
    experience: 62000,
    armor_class: 19,
  },
  key: "",
  user_id: "",
  alignment: "",
  size: "",
  type: "",
  hit_dice: "",
  hit_points: "",
  custom_hp: false,
  ability_scores: {
    str: 30,
    int: 18,
    dex: 10,
    wis: 15,
    con: 29,
    cha: 27,
  },
  movements: {
    walk: 0,
    swim: 0,
    burrow: 0,
    climb: 0,
    fly: 0,
    hover: false,
  },
  senses: {
    blindsight: 60,
    darkvision: 120,
    tremorsense: 0,
    truesight: 0,
    is_blind_beyond: false,
  },
  passive_perception: 26,
  saving_throws: [],
  nonmagical_attack_immunity: false,
  nonmagical_attack_resistance: false,
  damage_immunities: ["Fire"],
  damage_resistances: [],
  damage_vulnerabilities: [],
  languages: [],
  environment_id: "",

  traits: [
    {
      name: "Legendary Resistance (4/Day, or 5/Day in Lair).",
      description:
        "If the dragon fails a saving throw, it can choose to succeed instead.",
    },
  ],
  actions: [
    {
      name: "Multiattack.",
      description:
        "The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Scorching Ray (level 3 version).",
    },
    {
      name: "Rend.",
      description:
        "Melee Attack Roll: +17, reach 15 ft. Hit: 19 (2d8 + 10) Slashing damage plus 10 (3d6) Fire damage.",
    },
    {
      name: "Fire Breath (Recharge 5–6).",
      description:
        "Dexterity Saving Throw: DC 24, each creature in a 90-foot Cone. Failure: 91 (26d6) Fire damage. Success: Half damage.",
    },
    {
      name: "Spellcasting.",
      description:
        "The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 23, +15 to hit with spell attacks):",
    },
    {
      name: "At Will:",
      description:
        "Command (level 2 version), Detect Magic, Scorching Ray (level 3 version)",
    },
    {
      name: "1/Day Each:",
      description: "Fireball (level 6 version), Scrying",
    },
  ],
  reactions: [],
  legendary_description:
    "Legendary Action Uses: 3 (4 in Lair). Immediately after another creature’s turn, the dragon can expend a use to take one of the following actions. The dragon regains all expended uses at the start of each of its turns.",
  legendary_actions: [
    {
      name: "Commanding Presence.",
      description:
        "The dragon uses Spellcasting to cast Command (level 2 version). The dragon can’t take this action again until the start of its next turn.",
    },
    {
      name: "Fiery Rays.",
      description:
        "The dragon uses Spellcasting to cast Scorching Ray (level 3 version). The dragon can’t take this action again until the start of its next turn.",
    },
    {
      name: "Pounce.",
      description:
        "The dragon moves up to half its Speed, and it makes one Rend attack.",
    },
  ],
};
