import { CR_BENCHMARKS } from "./constants/cr-benchmarks";
import { calculateHitPoints, calculateStatBonus } from "./utils";
import type { CrBenchmark } from "./constants/cr-benchmarks";
import type { Monster } from "@/schema/monster-schema";
import { abilityScoresSchema } from "@/schema/monster-schema";

/**
 * Compares a creature's build against the Lazy GM benchmarks in
 * `CR_BENCHMARKS`. The table — not the guide's quick formulas — is the source
 * of every target number: the two diverge at the CR extremes (see the
 * cross-check in `cr-calculator.test.ts`). The formulas instead inform the
 * tolerances: AC/DC/attack bonus move at half a point per CR, so a flat ±1
 * already spans about two CR steps of wiggle room, and HP uses the table's own
 * published average-to-min spread.
 */

export type AbilityKey = keyof Monster["ability_scores"];

const ABILITY_KEYS = abilityScoresSchema.keyof().options;

export type CombatStats = {
  /** The ability driving the projections; ties go to canonical order. */
  bestAbility: AbilityKey;
  attackBonus: number;
  saveDc: number;
};

export type Classification = "low" | "on-par" | "high";

export type StatComparison = {
  actual: number;
  benchmark: number;
  tolerance: number;
  classification: Classification;
};

export type CrComparison = {
  benchmark: CrBenchmark;
  ac: StatComparison;
  dc: StatComparison;
  hp: StatComparison;
  attackBonus: StatComparison;
  /**
   * The creature's highest ability modifier vs the modifier the benchmark's
   * combined attack bonus implies once the creature's own proficiency bonus
   * is taken out.
   */
  abilityModifier: StatComparison & { ability: AbilityKey };
};

/** `"1/8"` → 0.125, `"5"` → 5. `NaN` for labels that aren't CRs. */
export function crToNumber(cr: string): number {
  const [numerator, denominator] = cr.split("/");
  return denominator
    ? Number(numerator) / Number(denominator)
    : Number(cr || Number.NaN);
}

export function benchmarkForCr(cr: string): CrBenchmark | undefined {
  return CR_BENCHMARKS.find((b) => b.cr === cr);
}

/**
 * Project the attack bonus and save DC from the creature's highest ability
 * modifier and proficiency bonus — deliberately independent of how (or
 * whether) the Actions text is written, so the guidance is stable from the
 * moment ability scores and a CR are set.
 */
export function extractCombatStats(
  monster: Pick<Monster, "ability_scores" | "cr">,
): CombatStats {
  let bestAbility: AbilityKey = ABILITY_KEYS[0];
  for (const key of ABILITY_KEYS) {
    if (
      calculateStatBonus(monster.ability_scores[key]) >
      calculateStatBonus(monster.ability_scores[bestAbility])
    ) {
      bestAbility = key;
    }
  }
  const bestModifier = calculateStatBonus(monster.ability_scores[bestAbility]);
  const pb = monster.cr.proficiency_bonus || 0;

  return {
    bestAbility,
    attackBonus: bestModifier + pb,
    saveDc: 8 + pb + bestModifier,
  };
}

export function classify(
  actual: number,
  benchmark: number,
  tolerance: number,
): Classification {
  if (actual < benchmark - tolerance) return "low";
  if (actual > benchmark + tolerance) return "high";
  return "on-par";
}

/** AC, save DC, and attack bonus move at ~half a point per CR: ±1 ≈ ±2 CRs. */
const POINT_TOLERANCE = 1;

function compare(
  actual: number,
  benchmark: number,
  tolerance: number,
): StatComparison {
  return {
    actual,
    benchmark,
    tolerance,
    classification: classify(actual, benchmark, tolerance),
  };
}

export function compareToCr(
  monster: Pick<
    Monster,
    | "cr"
    | "armor_class"
    | "hit_points"
    | "hit_dice"
    | "size"
    | "custom_hp"
    | "ability_scores"
  >,
): CrComparison | null {
  const benchmark = benchmarkForCr(monster.cr.challenge_rating);
  if (!benchmark) return null;

  const stats = extractCombatStats(monster);
  const pb = monster.cr.proficiency_bonus || 0;

  // Mirror MonsterStatblock's own HP derivation so the calculator and the
  // live preview never disagree about what the creature's HP is.
  const medianHP = calculateHitPoints(
    monster.hit_dice,
    monster.size,
    monster.ability_scores.con,
  );
  const hpText = monster.custom_hp
    ? monster.hit_points
    : medianHP || monster.hit_points;
  const hp = Number.parseInt(hpText, 10) || 0;

  return {
    benchmark,
    ac: compare(
      Number(monster.armor_class) || 0,
      benchmark.acDc,
      POINT_TOLERANCE,
    ),
    dc: compare(stats.saveDc, benchmark.acDc, POINT_TOLERANCE),
    hp: compare(hp, benchmark.hpAverage, benchmark.hpAverage - benchmark.hpMin),
    attackBonus: compare(
      stats.attackBonus,
      benchmark.proficientBonus,
      POINT_TOLERANCE,
    ),
    abilityModifier: {
      ...compare(
        calculateStatBonus(monster.ability_scores[stats.bestAbility]),
        benchmark.proficientBonus - pb,
        POINT_TOLERANCE,
      ),
      ability: stats.bestAbility,
    },
  };
}
