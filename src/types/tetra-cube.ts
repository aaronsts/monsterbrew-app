import { z } from "zod";

/**
 * Zod schema for a TetraCube monster export. Fields are lenient (defaulted) so
 * real exports with minor drift still parse; the ability-point fields act as the
 * format signature, so non-TetraCube JSON fails `safeParse`.
 */

const feature = z.object({ name: z.string(), desc: z.string() });

export const tetraCubeSchema = z.object({
  name: z.string().default(""),
  size: z.string().default(""),
  type: z.string().default(""),
  tag: z.string().default(""),
  alignment: z.string().default(""),
  hitDice: z.coerce.number().default(0),
  armorName: z.string().default(""),
  shieldBonus: z.coerce.number().default(0),
  natArmorBonus: z.coerce.number().default(0),
  otherArmorDesc: z.string().default(""),
  speed: z.coerce.number().default(0),
  burrowSpeed: z.coerce.number().default(0),
  climbSpeed: z.coerce.number().default(0),
  flySpeed: z.coerce.number().default(0),
  hover: z.boolean().default(false),
  swimSpeed: z.coerce.number().default(0),
  customHP: z.boolean().default(false),
  customSpeed: z.boolean().default(false),
  hpText: z.string().default(""),
  speedDesc: z.string().default(""),
  // Ability scores double as the format signature (required).
  strPoints: z.coerce.number(),
  dexPoints: z.coerce.number(),
  conPoints: z.coerce.number(),
  intPoints: z.coerce.number(),
  wisPoints: z.coerce.number(),
  chaPoints: z.coerce.number(),
  blindsight: z.coerce.number().default(0),
  blind: z.boolean().default(false),
  darkvision: z.coerce.number().default(0),
  tremorsense: z.coerce.number().default(0),
  truesight: z.coerce.number().default(0),
  telepathy: z.coerce.number().default(0),
  cr: z.string().default("0"),
  customCr: z.string().default(""),
  customProf: z.coerce.number().default(0),
  isLegendary: z.boolean().default(false),
  legendariesDescription: z.string().default(""),
  isLair: z.boolean().default(false),
  lairDescription: z.string().default(""),
  lairDescriptionEnd: z.string().default(""),
  isMythic: z.boolean().default(false),
  mythicDescription: z.string().default(""),
  isRegional: z.boolean().default(false),
  regionalDescription: z.string().default(""),
  regionalDescriptionEnd: z.string().default(""),
  properties: z.array(z.unknown()).default([]),
  abilities: z.array(feature).default([]),
  actions: z.array(feature).default([]),
  bonusActions: z.array(feature).default([]),
  reactions: z.array(feature).default([]),
  legendaries: z.array(feature).default([]),
  mythics: z.array(feature).default([]),
  lairs: z.array(feature).default([]),
  regionals: z.array(feature).default([]),
  sthrows: z
    .array(z.object({ name: z.string(), order: z.unknown().optional() }))
    .default([]),
  skills: z
    .array(
      z.object({
        name: z.string(),
        stat: z.string().default(""),
        note: z.string().optional(),
      }),
    )
    .default([]),
  damagetypes: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        stat: z.string().optional(),
      }),
    )
    .default([]),
  specialdamage: z.array(z.unknown()).default([]),
  conditions: z.array(z.object({ name: z.string() })).default([]),
  languages: z
    .array(z.object({ name: z.string(), speaks: z.boolean() }))
    .default([]),
  understandsBut: z.string().default(""),
  shortName: z.string().default(""),
  pluralName: z.string().default(""),
  doubleColumns: z.boolean().default(false),
  separationPoint: z.coerce.number().default(0),
  damage: z.array(z.unknown()).default([]),
});

export type TetraCubeCreature = z.infer<typeof tetraCubeSchema>;
