import { describe, expect, it } from "vitest";
import {
  ABILITY_SCORES,
  SKILLS_BY_ABILITY,
  damageStateStyles,
  formatModifier,
  nextDamageState,
  nextSkillState,
  setDamage,
  setSkill,
} from "./helpers";

describe("ABILITY_SCORES", () => {
  it("lists the six ability scores in order", () => {
    expect(ABILITY_SCORES).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
  });
});

describe("SKILLS_BY_ABILITY", () => {
  it("groups every skill under an ability that has at least one skill", () => {
    // Every group must be non-empty (empty groups are filtered out).
    expect(SKILLS_BY_ABILITY.every((group) => group.skills.length > 0)).toBe(
      true,
    );
  });

  it("only groups skills whose modifier matches the group ability", () => {
    for (const { ability, skills } of SKILLS_BY_ABILITY) {
      expect(skills.every((s) => s.skill_modifier === ability)).toBe(true);
    }
  });

  it("covers all 18 skills across the groups", () => {
    const total = SKILLS_BY_ABILITY.reduce(
      (sum, group) => sum + group.skills.length,
      0,
    );
    expect(total).toBe(18);
  });
});

describe("formatModifier", () => {
  it("prefixes a plus sign for zero and positive numbers", () => {
    expect(formatModifier(0)).toBe("+0");
    expect(formatModifier(3)).toBe("+3");
  });

  it("keeps the minus sign for negative numbers", () => {
    expect(formatModifier(-2)).toBe("-2");
  });
});

describe("nextSkillState", () => {
  it("cycles none -> proficient -> expert -> none", () => {
    expect(nextSkillState("")).toBe("proficient");
    expect(nextSkillState("proficient")).toBe("expert");
    expect(nextSkillState("expert")).toBe("");
  });
});

describe("nextDamageState", () => {
  it("cycles none -> resistant -> vulnerable -> immune -> none", () => {
    expect(nextDamageState("")).toBe("resistant");
    expect(nextDamageState("resistant")).toBe("vulnerable");
    expect(nextDamageState("vulnerable")).toBe("immune");
    expect(nextDamageState("immune")).toBe("");
  });
});

describe("setSkill", () => {
  it("adds a proficiency for a skill", () => {
    expect(setSkill({}, "stealth", "proficient")).toEqual({
      stealth: "proficient",
    });
  });

  it("overwrites an existing proficiency", () => {
    expect(setSkill({ stealth: "proficient" }, "stealth", "expert")).toEqual({
      stealth: "expert",
    });
  });

  it("removes a skill when the next state is empty", () => {
    expect(setSkill({ stealth: "proficient" }, "stealth", "")).toEqual({});
  });

  it("does not mutate the original object", () => {
    const original = { stealth: "proficient" } as const;
    setSkill(original, "arcana", "expert");
    expect(original).toEqual({ stealth: "proficient" });
  });
});

describe("setDamage", () => {
  it("adds a damage modifier", () => {
    expect(setDamage({}, "fire", "immune")).toEqual({ fire: "immune" });
  });

  it("overwrites an existing modifier", () => {
    expect(setDamage({ fire: "resistant" }, "fire", "vulnerable")).toEqual({
      fire: "vulnerable",
    });
  });

  it("removes a damage type when the next state is empty", () => {
    expect(setDamage({ fire: "resistant" }, "fire", "")).toEqual({});
  });

  it("does not mutate the original object", () => {
    const original = { fire: "resistant" } as const;
    setDamage(original, "cold", "immune");
    expect(original).toEqual({ fire: "resistant" });
  });
});

describe("damageStateStyles", () => {
  it("returns distinct colour classes per state", () => {
    expect(damageStateStyles("vulnerable")).toContain("text-red-400");
    expect(damageStateStyles("resistant")).toContain("text-amber-400");
    expect(damageStateStyles("immune")).toContain("text-green-500");
  });

  it("returns the muted default for an empty state", () => {
    expect(damageStateStyles("")).toContain("text-muted-foreground");
  });
});
