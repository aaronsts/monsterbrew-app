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

const damageTypesSchema = z.union([
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

const languagesSchema = z.union([
	z.literal("abyssal"),
	z.literal("celestial"),
	z.literal("common"),
	z.literal("deep-speech"),
	z.literal("draconic"),
	z.literal("druidic"),
	z.literal("dwarvish"),
	z.literal("elvish"),
	z.literal("giant"),
	z.literal("gnomish"),
	z.literal("goblin"),
	z.literal("halfling"),
	z.literal("infernal"),
	z.literal("orc"),
	z.literal("primordial"),
	z.literal("sylvan"),
	z.literal("thieves-cant"),
	z.literal("undercommon"),
]);

export const createCreatureSchema = z.object({
	actions: z.array(jsonSchema).optional(),
	alignment: z.string().optional().nullable(),
	armor_class: z.number().optional().nullable(),
	created_at: z.string().optional(),
	damage_immunities: damageTypesSchema.optional().nullable(),
	damage_resistances: damageTypesSchema.optional().nullable(),
	damage_vulnerabilities: damageTypesSchema.optional().nullable(),
	description: z.string().optional().nullable(),
	environment_id: z.string().optional().nullable(),
	hit_dice: z.string(),
	hit_points: z.number().optional().nullable(),
	id: z.string().optional(),
	is_public: z.boolean().optional(),
	key: z.string(),
	languages: languagesSchema.optional().nullable(),
	name: z.string(),
	nonmagical_attack_immunity: z.boolean().optional(),
	nonmagical_attack_resistance: z.boolean().optional(),
	passive_perception: z.number().optional(),
	size: z.number(),
	type: z.number(),
	user_id: z.string(),
});
