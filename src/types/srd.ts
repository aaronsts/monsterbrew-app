import { z } from "zod";

/**
 * Shape of a monster entry in `src/data/srd-monsters.json` (D&D 2024 SRD).
 * This is the external format; `fromSrd` in
 * `src/services/converters/from-srd.ts` maps it onto the canonical `Monster`.
 */
export const srdMonsterSchema = z.object({
  key: z.string(),
  name: z.string(),
  size: z.string(),
  type: z.string(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  alignment: z.string().optional().default(""),
  armor_class: z.coerce.number(),
  armor_detail: z.string().optional().default(""),
  hit_points: z.coerce.number(),
  hit_dice: z.string().optional().default(""),
  speed: z
    .object({
      walk: z.number().optional(),
      swim: z.number().optional(),
      fly: z.number().optional(),
      climb: z.number().optional(),
      burrow: z.number().optional(),
      hover: z.union([z.number(), z.boolean()]).optional(),
    })
    .default({}),
  ability_scores: z.object({
    strength: z.coerce.number(),
    dexterity: z.coerce.number(),
    constitution: z.coerce.number(),
    intelligence: z.coerce.number(),
    wisdom: z.coerce.number(),
    charisma: z.coerce.number(),
  }),
  saving_throws: z.record(z.string(), z.number()).default({}),
  skill_bonuses: z.record(z.string(), z.number()).default({}),
  passive_perception: z.coerce.number().optional().default(0),
  darkvision_range: z.number().nullable().optional(),
  blindsight_range: z.number().nullable().optional(),
  tremorsense_range: z.number().nullable().optional(),
  truesight_range: z.number().nullable().optional(),
  languages: z.string().optional().default(""),
  challenge_rating_text: z.string(),
  resistances_and_immunities: z
    .object({
      damage_immunities_display: z.string().optional().default(""),
      damage_resistances_display: z.string().optional().default(""),
      damage_vulnerabilities_display: z.string().optional().default(""),
      condition_immunities_display: z.string().optional().default(""),
    })
    .default({}),
  actions: z
    .array(
      z.object({
        name: z.string(),
        desc: z.string(),
        action_type: z.string().optional().default("ACTION"),
      }),
    )
    .default([]),
  traits: z
    .array(z.object({ name: z.string(), desc: z.string() }))
    .default([]),
});

export type SrdMonster = z.infer<typeof srdMonsterSchema>;
