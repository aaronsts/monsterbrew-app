import { describe, expect, it } from "vitest";
import {
  findChallengeRating,
  parsePassivePerception,
  parseSenses,
  toDamageModifiers,
  toLanguages,
  toSavingThrows,
  toSkills,
} from "@/services/converters/monster-mappers";

describe("toSavingThrows", () => {
  it("normalises mixed-case and full-word ability labels", () => {
    expect(toSavingThrows(["Dex", "Con", "strength"])).toEqual({
      dex: true,
      con: true,
      str: true,
    });
  });

  it("ignores empty and unknown entries", () => {
    expect(toSavingThrows(["", null, undefined, "xyz"])).toEqual({});
  });
});

describe("toSkills", () => {
  it("maps proficient/expert and drops unknown skills", () => {
    expect(
      toSkills([
        { name: "Perception", isExpert: true },
        { name: "Stealth" },
        { name: "not-a-skill", isExpert: true },
      ]),
    ).toEqual({ perception: "expert", stealth: "proficient" });
  });
});

describe("toDamageModifiers", () => {
  it("merges the three lists with immune winning", () => {
    expect(
      toDamageModifiers({
        vulnerable: ["Fire"],
        resistant: ["cold", "fire"],
        immune: ["fire", "poison"],
      }),
    ).toEqual({ fire: "immune", cold: "resistant", poison: "immune" });
  });
});

describe("toLanguages", () => {
  it("splits known enum languages from custom ones", () => {
    const result = toLanguages(["Common", "Draconic", "Thieves' Argot"]);
    expect(result.languages).toEqual(["common", "draconic"]);
    expect(result.custom_languages).toEqual(["thieves' argot"]);
  });
});

describe("findChallengeRating", () => {
  it("resolves fractional CRs from numbers and strings", () => {
    expect(findChallengeRating(0.25).challenge_rating).toBe("1/4");
    expect(findChallengeRating("0.5").challenge_rating).toBe("1/2");
    expect(findChallengeRating("5").challenge_rating).toBe("5");
  });

  it("falls back to CR 0 for unknown values", () => {
    expect(findChallengeRating("nonsense").challenge_rating).toBe("0");
  });
});

describe("parseSenses / parsePassivePerception", () => {
  it("extracts numeric ranges and passive perception", () => {
    const senses = ["blindsight 60 ft.", "darkvision 120 ft.", "passive Perception 26"];
    expect(parseSenses(senses)).toMatchObject({ blindsight: 60, darkvision: 120 });
    expect(parsePassivePerception(senses)).toBe(26);
  });

  it("returns null passive perception when absent", () => {
    expect(parsePassivePerception(["darkvision 60 ft."])).toBeNull();
  });
});
