import { z } from "zod";

/**
 * Zod schema for an Open5e (v1 API) creature. The full ability-score words are
 * the format signature (required); everything else is lenient so real API
 * responses with optional/missing fields still parse.
 */

const action = z.object({
  name: z.string(),
  desc: z.string(),
  attack_bonus: z.coerce.number().optional(),
  damage_dice: z.string().optional(),
  damage_bonus: z.coerce.number().optional(),
});

const namedEntry = z.object({ name: z.string(), desc: z.string() });

export const open5eSchema = z.object({
  slug: z.string().default(""),
  desc: z.string().default(""),
  name: z.string().default(""),
  size: z.string().default(""),
  type: z.string().default(""),
  subtype: z.string().default(""),
  group: z.string().default(""),
  alignment: z.string().default(""),
  armor_class: z.coerce.number().default(0),
  armor_desc: z.string().default(""),
  hit_points: z.coerce.number().default(0),
  hit_dice: z.string().default(""),
  speed: z
    .object({
      walk: z.coerce.number().optional(),
      climb: z.coerce.number().optional(),
      fly: z.coerce.number().optional(),
      swim: z.coerce.number().optional(),
      burrow: z.coerce.number().optional(),
      hover: z.boolean().optional(),
    })
    .default({}),
  // Ability scores are the signature (required).
  strength: z.coerce.number(),
  dexterity: z.coerce.number(),
  constitution: z.coerce.number(),
  intelligence: z.coerce.number(),
  wisdom: z.coerce.number(),
  charisma: z.coerce.number(),
  strength_save: z.coerce.number().nullable().default(null),
  dexterity_save: z.coerce.number().nullable().default(null),
  constitution_save: z.coerce.number().nullable().default(null),
  intelligence_save: z.coerce.number().nullable().default(null),
  wisdom_save: z.coerce.number().nullable().default(null),
  charisma_save: z.coerce.number().nullable().default(null),
  perception: z.coerce.number().default(0),
  skills: z.record(z.string(), z.coerce.number()).default({}),
  damage_vulnerabilities: z.string().default(""),
  damage_resistances: z.string().default(""),
  damage_immunities: z.string().default(""),
  condition_immunities: z.string().default(""),
  senses: z.string().default(""),
  languages: z.string().default(""),
  challenge_rating: z.string().default("0"),
  cr: z.coerce.number().default(0),
  actions: z.array(action).default([]),
  bonus_actions: z.array(action).nullable().default(null),
  reactions: z.array(action).nullable().default(null),
  legendary_desc: z.string().default(""),
  legendary_actions: z.array(namedEntry).default([]),
  special_abilities: z.array(namedEntry).default([]),
  spell_list: z.array(z.unknown()).default([]),
  page_no: z.coerce.number().optional(),
  environments: z.array(z.string()).default([]),
});

export type Open5eCreature = z.infer<typeof open5eSchema>;
