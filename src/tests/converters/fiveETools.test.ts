import { describe, it, expect, vi } from "vitest";
import { from5ETools } from "@/services/converters/fiveETools";
import { defaultCreature } from "@/schema/createCreatureSchema";
import { CHALLENGE_RATINGS } from "@/lib/constants";
import { z } from "zod";
import { fiveECreatureSchema } from "@/types/fiveETools";

// Mock the toast function
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("fiveETools converter", () => {
  it("should convert a basic creature correctly", () => {
    const mockSource: z.infer<typeof fiveECreatureSchema> = {
      source: "",
      name: "Test Monster",
      size: ["M"],
      type: "humanoid",
      alignment: ["N", "G"],
      ac: [15],
      hp: { average: 45, formula: "10d8" },
      speed: { walk: 30, fly: 60 },
      str: 16,
      dex: 14,
      con: 12,
      int: 10,
      wis: 8,
      cha: 6,
      save: { str: "+5", dex: "+4" },
      skill: { perception: "+3", stealth: "+6" },
      passive: 13,
      languages: ["Common", "Elvish"],
      cr: "2",
    };

    const result = from5ETools(mockSource);

    expect(result.name).toBe("Test Monster");
    expect(result.size).toBe("medium");
    expect(result.type).toBe("humanoid");
    expect(result.alignment).toBe("Neutral Good");
    expect(result.armor_class).toBe("15");
    expect(result.hit_points).toBe("45");
    expect(result.hit_dice).toBe("10");
    expect(result.movements.walk).toBe(30);
    expect(result.movements.fly).toBe(60);
    expect(result.ability_scores.str).toBe(16);
    expect(result.ability_scores.dex).toBe(14);
    expect(result.ability_scores.con).toBe(12);
    expect(result.ability_scores.int).toBe(10);
    expect(result.ability_scores.wis).toBe(8);
    expect(result.ability_scores.cha).toBe(6);
    expect(result.saving_throws).toEqual(["str", "dex"]);
    expect(result.passive_perception).toBe(13);
    expect(result.languages).toEqual(["Common", "Elvish"]);
    expect(result.cr).toEqual(
      CHALLENGE_RATINGS.find((c) => c.challenge_rating === "2")
    );
  });

  it("should handle complex type objects", () => {
    const mockSource = {
      source: "",
      name: "Complex Type Monster",
      size: ["L"],
      type: { type: "monstrosity", tags: ["shapechanger"] },
      alignment: ["C", "E"],
      ac: [16],
      hp: { average: 60, formula: "8d10+16" },
      cr: "3",
    };

    const result = from5ETools(mockSource);

    expect(result.name).toBe("Complex Type Monster");
    expect(result.type).toBe("monstrosity");
    expect(result.alignment).toBe("Chaotic Evil");
    expect(result.cr.proficiency_bonus).toBe(2);
    expect(result.armor_class).toBe("16");
  });

  it("should handle complex type with choose array", () => {
    const mockSource = {
      source: "",
      name: "Choose Type Monster",
      size: ["H"],
      type: { type: { choose: ["aberration", "fiend"] } },
      alignment: ["L", "N"],
      ac: [17],
      hp: { average: 80, formula: "10d12+20" },
      cr: "5",
    };

    const result = from5ETools(mockSource);

    expect(result.name).toBe("Choose Type Monster");
    expect(result.type).toBe("aberration");
  });

  it("should handle damage immunities, resistances and vulnerabilities", () => {
    const mockSource = {
      source: "",
      name: "Damage Types Monster",
      size: ["M"],
      type: "undead",
      alignment: ["N"],
      ac: [12],
      hp: { average: 30, formula: "4d8+12" },
      immune: [
        "poison",
        "necrotic",
        { immune: ["cold"], note: "from non-magical attacks" },
      ],
      resist: [
        "fire",
        { resist: ["bludgeoning"], note: "from non-magical attacks" },
      ],
      vulnerable: ["radiant"],
      cr: "1",
    };

    const result = from5ETools(mockSource);

    expect(result.hit_dice).toBe("4");
    expect(result.damage_immunities).toContain("poison");
    expect(result.damage_immunities).toContain("necrotic");
    expect(result.damage_immunities).toContain("cold");
    expect(result.damage_resistances).toContain("fire");
    expect(result.damage_resistances).toContain("bludgeoning");
    expect(result.damage_vulnerabilities).toContain("radiant");
  });

  it("should handle senses correctly", () => {
    const mockSource = {
      source: "",
      name: "Senses Monster",
      size: ["S"],
      type: "construct",
      alignment: ["L", "G"],
      ac: [18],
      hp: { average: 50, formula: "6d8+24" },
      senses: [
        "darkvision 60 ft",
        "blindsight 30 ft (blind beyond this radius)",
        "tremorsense 20 ft",
      ],
      cr: "4",
    };

    const result = from5ETools(mockSource);

    expect(result.senses.darkvision).toBe(60);
    expect(result.senses.blindsight).toBe(30);
    expect(result.senses.is_blind_beyond).toBe(true);
    expect(result.senses.tremorsense).toBe(20);
  });

  it("should handle error cases gracefully", () => {
    const invalidSource = {
      // Missing required fields like size
      name: "Invalid Monster",
      type: "aberration",
      alignment: ["C", "E"],
    } as z.infer<typeof fiveECreatureSchema>;

    const result = from5ETools(invalidSource);

    // Should return defaultCreature when conversion fails
    expect(result).toEqual(defaultCreature);
  });
});
