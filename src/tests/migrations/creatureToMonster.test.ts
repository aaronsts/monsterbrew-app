import { describe, it, expect } from "vitest";
import {
  creatureToMonster,
  StoredMonster,
} from "@/services/migrations/creatureToMonster";
import { createCreatureSchema, defaultCreature } from "@/schema/createCreatureSchema";
import { monsterSchema } from "@/schema/monster-schema";
import { z } from "zod";

type LegacyCreature = z.infer<typeof createCreatureSchema>;

/** Build a legacy creature by overriding the canonical default. */
function legacy(overrides: Partial<LegacyCreature> = {}): LegacyCreature {
  return { ...defaultCreature, ...overrides };
}

/** Strip the storage-only identity fields so the rest can be schema-validated. */
function monsterPart(stored: StoredMonster) {
  const { id: _id, is_public: _isPublic, ...monster } = stored;
  void _id;
  void _isPublic;
  return monster;
}

describe("creatureToMonster", () => {
  it("produces a value that satisfies monsterSchema for a rich creature", () => {
    const source = legacy({
      id: "abc-123",
      name: "Ancient Red Dragon",
      type: "dragon",
      size: "gargantuan",
      alignment: "chaotic evil",
      description: "A terrifying wyrm.",
      hit_points: "546",
      hit_dice: "28d20 + 252",
      custom_hp: true,
      passive_perception: 26,
      custom_passive_perception: true,
      nonmagical_attack_immunity: true,
      nonmagical_attack_resistance: false,
      saving_throws: ["dex", "con", "wis", "cha"],
      skill_bonuses: [
        {
          skill_name: "perception",
          skill_modifier: "wis",
          is_proficient: true,
          is_expert: true,
        },
        {
          skill_name: "stealth",
          skill_modifier: "dex",
          is_proficient: true,
        },
      ],
      damage_immunities: ["fire"],
      condition_immunities: ["frightened"],
      traits: [{ name: "Legendary Resistance", description: "3/day." }],
      actions: [{ name: "Bite", description: "Bites." }],
      is_legendary: true,
      legendary_description: "3 legendary actions.",
      legendary_actions: [{ name: "Tail", description: "Tail attack." }],
    });

    const result = creatureToMonster(source);

    // The mapped shape (sans storage identity) is valid new-schema data.
    expect(() => monsterSchema.parse(monsterPart(result))).not.toThrow();
  });

  it("maps the saving_throws array to a boolean object and ignores unknown entries", () => {
    const result = creatureToMonster(
      legacy({ saving_throws: ["str", "con", "bogus"] }),
    );

    expect(result.saving_throws).toEqual({ str: true, con: true });
    expect(result.saving_throws).not.toHaveProperty("bogus");
  });

  it("maps skill_bonuses to a record with expert winning over proficient", () => {
    const result = creatureToMonster(
      legacy({
        skill_bonuses: [
          {
            skill_name: "perception",
            skill_modifier: "wis",
            is_proficient: true,
            is_expert: true,
          },
          {
            skill_name: "stealth",
            skill_modifier: "dex",
            is_proficient: true,
          },
          {
            skill_name: "arcana",
            skill_modifier: "int",
            is_proficient: false,
            is_expert: false,
          },
        ],
      }),
    );

    expect(result.skills).toEqual({
      perception: "expert",
      stealth: "proficient",
    });
    // Entry with neither flag is dropped.
    expect(result.skills).not.toHaveProperty("arcana");
  });

  it("merges the three damage arrays with immune > resistant > vulnerable precedence", () => {
    const result = creatureToMonster(
      legacy({
        damage_vulnerabilities: ["cold", "fire"],
        damage_resistances: ["fire", "poison"],
        damage_immunities: ["fire", "necrotic"],
      }),
    );

    expect(result.damage_modifiers).toEqual({
      cold: "vulnerable",
      poison: "resistant",
      necrotic: "immune",
      fire: "immune", // present in all three -> immune wins
    });
  });

  it("copies proficiency_bonus from cr.proficiency_bonus to the top level", () => {
    const source = legacy();
    source.cr = { ...source.cr, proficiency_bonus: 6 };

    expect(creatureToMonster(source).proficiency_bonus).toBe(6);
  });

  it("defaults the new-only fields that have no legacy source", () => {
    const result = creatureToMonster(legacy());

    expect(result.bonus_actions).toEqual([]);
    expect(result.has_lair).toBe(false);
    expect(result.lair_description).toBe("");
    expect(result.lair_actions).toEqual([]);
  });

  it("normalizes a null description to undefined", () => {
    const result = creatureToMonster(legacy({ description: null }));

    expect(result.description).toBeUndefined();
  });

  it("preserves an existing id and drops user_id / environment_id", () => {
    const result = creatureToMonster(
      legacy({ id: "keep-me", user_id: "u1", environment_id: "e1" }),
    );

    expect(result.id).toBe("keep-me");
    expect(result).not.toHaveProperty("user_id");
    expect(result).not.toHaveProperty("environment_id");
  });

  it("generates an id when the legacy record has none", () => {
    const result = creatureToMonster(legacy({ id: "" }));

    expect(result.id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});
