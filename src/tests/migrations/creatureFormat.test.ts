import { describe, expect, it } from "vitest";
import {
  getCreatureFormat,
  isLegacyCreature,
} from "@/services/migrations/creatureFormat";
import { defaultCreature } from "@/schema/createCreatureSchema";
import { defaultMonster } from "@/schema/monster-schema";

describe("getCreatureFormat", () => {
  it("classifies a legacy record (saving_throws array) as legacy", () => {
    expect(getCreatureFormat(defaultCreature)).toBe("legacy");
    expect(getCreatureFormat({ saving_throws: ["str", "con"] })).toBe("legacy");
    expect(getCreatureFormat({ saving_throws: [] })).toBe("legacy");
  });

  it("classifies a new record (saving_throws object) as monster", () => {
    expect(getCreatureFormat(defaultMonster)).toBe("monster");
    expect(getCreatureFormat({ saving_throws: { str: true } })).toBe("monster");
  });

  it("defaults ambiguous / garbage input to monster (never the destructive path)", () => {
    expect(getCreatureFormat(null)).toBe("monster");
    expect(getCreatureFormat(undefined)).toBe("monster");
    expect(getCreatureFormat("nope")).toBe("monster");
    expect(getCreatureFormat({})).toBe("monster");
    expect(getCreatureFormat({ saving_throws: "str,con" })).toBe("monster");
  });
});

describe("isLegacyCreature", () => {
  it("is true only for legacy records", () => {
    expect(isLegacyCreature(defaultCreature)).toBe(true);
    expect(isLegacyCreature(defaultMonster)).toBe(false);
    expect(isLegacyCreature(null)).toBe(false);
  });
});
