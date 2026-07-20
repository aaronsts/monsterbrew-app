import { describe, it, expect } from "vitest";
import { from5eTools } from "@/services/converters/from-5e-tools";
import { monsterSchema } from "@/schema/monster-schema";

const source = {
  name: "Test Fiend",
  source: "MM",
  size: ["L"],
  type: "fiend",
  alignment: ["L", "E"],
  ac: [{ ac: 17, from: ["natural armor"] }],
  hp: { average: 84, formula: "8d10+40" },
  speed: { walk: 40, fly: 60, canHover: true },
  str: 18,
  dex: 15,
  con: 20,
  int: 14,
  wis: 12,
  cha: 16,
  save: { dex: "+5", con: "+8" },
  skill: { perception: "+8", stealth: "+5" },
  senses: ["darkvision 120 ft.", "blindsight 30 ft."],
  passive: 18,
  languages: ["Common", "Infernal"],
  cr: "5",
  immune: ["fire", { immune: ["poison"], note: "from a ring" }],
  conditionImmune: ["poisoned"],
  action: [{ name: "Multiattack", entries: ["It makes two attacks."] }],
  legendary: [{ name: "Attack", entries: ["The fiend attacks."] }],
};

describe("from5eTools", () => {
  it("produces a schema-valid monster", () => {
    expect(monsterSchema.safeParse(from5eTools(source)).success).toBe(true);
  });

  it("maps abbreviations, flattened lists and CR-based expertise", () => {
    const monster = from5eTools(source);
    expect(monster.size).toBe("large");
    expect(monster.alignment).toBe("Lawful Evil");
    expect(monster.armor_class).toBe(17);
    expect(monster.hit_points).toBe("84");
    expect(monster.hit_dice).toBe("8");
    expect(monster.movements).toMatchObject({ walk: 40, fly: 60, hover: true });
    expect(monster.saving_throws).toEqual({ dex: true, con: true });
    // CR 5 -> proficiency bonus 3; +8 clears the +6 expert threshold, +5 doesn't.
    expect(monster.skills).toEqual({ perception: "expert", stealth: "proficient" });
    expect(monster.damage_modifiers).toEqual({ fire: "immune", poison: "immune" });
    expect(monster.condition_immunities).toEqual(["poisoned"]);
    expect(monster.senses).toMatchObject({ darkvision: 120, blindsight: 30 });
    expect(monster.languages).toEqual(["common", "infernal"]);
    expect(monster.is_legendary).toBe(true);
  });

  it("throws on JSON that isn't a 5eTools creature", () => {
    expect(() => from5eTools({ foo: "bar" })).toThrow();
  });
});
