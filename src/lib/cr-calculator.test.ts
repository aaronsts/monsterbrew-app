import { describe, expect, it } from "vitest";
import {
  benchmarkForCr,
  classify,
  compareToCr,
  crToNumber,
  extractCombatStats,
} from "./cr-calculator";
import { CR_BENCHMARKS } from "./constants/cr-benchmarks";
import type { Monster } from "@/schema/monster-schema";

/** STR 20 (+5), DEX 14 (+2), CON 16 (+3), WIS 12 (+1), CHA 8 (-1). */
const ABILITY_SCORES: Monster["ability_scores"] = {
  str: 20,
  dex: 14,
  con: 16,
  int: 10,
  wis: 12,
  cha: 8,
};

function makeCr(challenge_rating: string, proficiency_bonus: number) {
  return {
    challenge_rating,
    proficiency_bonus,
    hit_points_range: "",
    attack_bonus: 0,
    damage_per_round: "",
    save_dc: 0,
    experience: 0,
    armor_class: 0,
  };
}

describe("crToNumber", () => {
  it("converts fraction labels", () => {
    expect(crToNumber("1/8")).toBe(0.125);
    expect(crToNumber("1/4")).toBe(0.25);
    expect(crToNumber("1/2")).toBe(0.5);
  });

  it("converts whole-number labels", () => {
    expect(crToNumber("0")).toBe(0);
    expect(crToNumber("5")).toBe(5);
    expect(crToNumber("30")).toBe(30);
  });

  it("returns NaN for labels that are not CRs", () => {
    expect(crToNumber("")).toBeNaN();
    expect(crToNumber("boss")).toBeNaN();
  });
});

describe("benchmarkForCr", () => {
  it("finds the row for a known CR", () => {
    const row = benchmarkForCr("5");
    expect(row?.acDc).toBe(15);
    expect(row?.hpAverage).toBe(95);
    expect(row?.proficientBonus).toBe(7);
  });

  it("returns undefined for unknown or empty CRs", () => {
    expect(benchmarkForCr("")).toBeUndefined();
    expect(benchmarkForCr("31")).toBeUndefined();
  });
});

describe("extractCombatStats", () => {
  const base = { ability_scores: ABILITY_SCORES, cr: makeCr("5", 4) };

  it("projects the attack bonus and save DC from the best ability modifier", () => {
    const stats = extractCombatStats(base);
    expect(stats.bestAbility).toBe("str"); // +5, the highest
    expect(stats.attackBonus).toBe(9); // +5 STR + 4 PB
    expect(stats.saveDc).toBe(17); // 8 + 4 PB + 5 STR
  });

  it("follows the highest ability wherever it sits", () => {
    const stats = extractCombatStats({
      ...base,
      ability_scores: { str: 8, dex: 18, con: 10, int: 10, wis: 10, cha: 10 },
    });
    expect(stats.bestAbility).toBe("dex"); // +4
    expect(stats.attackBonus).toBe(8); // +4 DEX + 4 PB
    expect(stats.saveDc).toBe(16); // 8 + 4 PB + 4 DEX
  });

  it("breaks ties in canonical ability order", () => {
    const stats = extractCombatStats({
      ...base,
      ability_scores: { str: 10, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
    });
    expect(stats.bestAbility).toBe("dex");
  });
});

describe("classify", () => {
  it("treats the tolerance edges as on-par", () => {
    expect(classify(14, 15, 1)).toBe("on-par");
    expect(classify(16, 15, 1)).toBe("on-par");
    expect(classify(15, 15, 1)).toBe("on-par");
  });

  it("flags values just past the tolerance", () => {
    expect(classify(13, 15, 1)).toBe("low");
    expect(classify(17, 15, 1)).toBe("high");
  });

  it("works with wide tolerances", () => {
    expect(classify(28, 35, 7)).toBe("on-par");
    expect(classify(27, 35, 7)).toBe("low");
    expect(classify(43, 35, 7)).toBe("high");
  });
});

describe("compareToCr", () => {
  // Real CR 5: PB +3, benchmark AC/DC 15, HP 95 (71–119), attack +7.
  const monster = {
    cr: makeCr("5", 3),
    armor_class: 15,
    hit_points: "",
    hit_dice: "10",
    size: "medium",
    custom_hp: false,
    ability_scores: ABILITY_SCORES,
  };

  it("returns null when the CR has no benchmark row", () => {
    expect(compareToCr({ ...monster, cr: makeCr("", 2) })).toBeNull();
  });

  it("compares a creature end-to-end against its CR benchmark", () => {
    const result = compareToCr(monster);
    expect(result).not.toBeNull();
    expect(result?.benchmark.cr).toBe("5");

    expect(result?.ac).toMatchObject({
      actual: 15,
      benchmark: 15,
      classification: "on-par",
    });
    // Derived HP: 10d8 at CON +3 -> "75 (10d8 + 30)" -> 75, within 95 ± 24.
    expect(result?.hp).toMatchObject({
      actual: 75,
      benchmark: 95,
      tolerance: 24,
      classification: "on-par",
    });
    // Projected to-hit: +5 STR + 3 PB = 8, within 7 ± 1.
    expect(result?.attackBonus).toMatchObject({
      actual: 8,
      benchmark: 7,
      classification: "on-par",
    });
    // Projected DC: 8 + 3 PB + 5 STR = 16, within 15 ± 1.
    expect(result?.dc).toMatchObject({
      actual: 16,
      classification: "on-par",
    });
    // Best modifier +5 STR vs the +4 the benchmark's +7 attack implies
    // once the creature's own +3 PB is taken out.
    expect(result?.abilityModifier).toMatchObject({
      ability: "str",
      actual: 5,
      benchmark: 4,
      classification: "on-par",
    });
  });

  it("uses the manual hit_points string when custom_hp is set", () => {
    const result = compareToCr({
      ...monster,
      custom_hp: true,
      hit_points: "200 (16d12 + 96)",
    });
    expect(result?.hp.actual).toBe(200);
    expect(result?.hp.classification).toBe("high");
  });

  it("falls back to the hit_points string when hit dice cannot derive HP", () => {
    const result = compareToCr({
      ...monster,
      hit_dice: "",
      hit_points: "40",
    });
    expect(result?.hp.actual).toBe(40);
    expect(result?.hp.classification).toBe("low"); // below 95 - 24
  });

  it("takes the HP tolerance from the table's own average-to-min spread", () => {
    for (const cr of ["1", "10", "20"]) {
      const row = benchmarkForCr(cr);
      const result = compareToCr({ ...monster, cr: makeCr(cr, 3) });
      expect(result?.hp.tolerance).toBe(row!.hpAverage - row!.hpMin);
    }
  });

});

describe("CR_BENCHMARKS vs the quick-reference formulas", () => {
  // The guide's quick formulas (AC/DC = 12 + CR/2, HP = 15×CR + 15,
  // attack = 4 + CR/2, damage = 7×CR + 5) genuinely approximate the table
  // from CR 1/2 through 20; below and above that the hand-tuned table
  // deliberately walks away from the straight lines. Tight band in the core
  // range, loose typo-sized net outside it — if either data source is edited
  // out of sync with the other, this fails instead of drifting silently.
  it("every row stays within the documented margin of its formula prediction", () => {
    const violations: Array<string> = [];
    for (const row of CR_BENCHMARKS) {
      const cr = crToNumber(row.cr);
      const core = cr >= 0.5 && cr <= 20;
      const check = (label: string, actual: number, formula: number) => {
        const band = core
          ? Math.max(3, formula * 0.2)
          : Math.max(13, formula * 0.5);
        if (Math.abs(actual - formula) > band) {
          violations.push(
            `CR ${row.cr} ${label}: table ${actual} vs formula ` +
              `${formula.toFixed(1)} (allowed ±${band.toFixed(1)})`,
          );
        }
      };
      check("acDc", row.acDc, 12 + cr / 2);
      check("hpAverage", row.hpAverage, 15 * cr + 15);
      check("proficientBonus", row.proficientBonus, 4 + cr / 2);
      check("damagePerRound", row.damagePerRound, 7 * cr + 5);
    }
    expect(violations).toEqual([]);
  });
});
