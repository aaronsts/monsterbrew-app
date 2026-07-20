import { z } from "zod";

/**
 * Zod schema for an Improved Initiative statblock export. The `Abilities`/`HP`/
 * `AC` blocks are the format signature (required); the rest is lenient so real
 * exports still parse and so the round-trip export in the legacy converter has
 * every field it writes.
 */

const namedContent = z.object({ Name: z.string(), Content: z.string() });
const valueNotes = z.object({
  Value: z.coerce.number(),
  Notes: z.string().default(""),
});

export const improvedInitiativeSchema = z.object({
  Source: z.string().default(""),
  Type: z.string().default(""),
  HP: valueNotes,
  AC: valueNotes,
  InitiativeModifier: z.coerce.number().default(0),
  InitiativeAdvantage: z.boolean().default(false),
  Speed: z.array(z.string()).default([]),
  Abilities: z.object({
    Str: z.coerce.number(),
    Dex: z.coerce.number(),
    Con: z.coerce.number(),
    Int: z.coerce.number(),
    Wis: z.coerce.number(),
    Cha: z.coerce.number(),
  }),
  DamageVulnerabilities: z.array(z.string()).default([]),
  DamageResistances: z.array(z.string()).default([]),
  DamageImmunities: z.array(z.string()).default([]),
  ConditionImmunities: z.array(z.string()).default([]),
  Saves: z
    .array(z.object({ Name: z.string(), Modifier: z.coerce.number() }))
    .default([]),
  Skills: z
    .array(z.object({ Name: z.string(), Modifier: z.coerce.number() }))
    .default([]),
  Senses: z.array(z.string()).default([]),
  Languages: z.array(z.string()).default([]),
  Challenge: z.string().default("0"),
  Traits: z.array(namedContent).default([]),
  Actions: z.array(namedContent).default([]),
  BonusActions: z.array(namedContent).default([]),
  Reactions: z.array(namedContent).default([]),
  LegendaryActions: z.array(namedContent).default([]),
  MythicActions: z.array(namedContent).default([]),
  Description: z.string().default(""),
  Player: z.string().default(""),
  Version: z.string().default(""),
  ImageURL: z.string().default(""),
});

export type ImprovedInitiativeCreature = z.infer<
  typeof improvedInitiativeSchema
>;
