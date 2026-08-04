import { CR_BENCHMARKS } from "./constants/cr-benchmarks";
import { calculateHitPoints, calculateStatBonus } from "./utils";
import { estimateDamagePerRound } from "./damage-per-round";
import type { DamagePerRoundEstimate } from "./damage-per-round";
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
  /** The ability driving the projections; never CON, ties go to canonical order. */
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

export type DamagePerRoundComparison = StatComparison & {
  /** Where the damage came from, for explaining the number. */
  estimate: DamagePerRoundEstimate;
  /** The CR this much damage suits — the offensive half of the CR cross-check. */
  suggestedCr: string | null;
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
  /** `null` when the features carry no readable damage tag — see `estimateDamagePerRound`. */
  damagePerRound: DamagePerRoundComparison | null;
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
 * moment ability scores and a CR are set. CON is skipped: no attack or
 * spellcasting ability is ever CON-linked, so a high CON (common on brutes)
 * must not drive the projection.
 */
export function extractCombatStats(
  monster: Pick<Monster, "ability_scores" | "cr">,
): CombatStats {
  let bestAbility: AbilityKey = ABILITY_KEYS[0];
  for (const key of ABILITY_KEYS) {
    if (key === "con") continue;
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

/**
 * Legendary creatures are budgeted about 25% above their row. The guide's
 * offense chapter states it, and Tom Dunn's fit of the 2024 Monster Manual
 * puts ordinary monsters at 6 + 6 damage per CR against 7.5 + 7.5 for
 * legendary ones — the same 25% gap.
 */
export const LEGENDARY_DAMAGE_PREMIUM = 1.25;

/**
 * Damage swings far harder than a point-scale stat, so its tolerance is
 * proportional rather than flat: 25% mirrors the table's own average-to-min HP
 * spread and works out to roughly two and a half CR steps of damage at any CR.
 */
const DAMAGE_TOLERANCE_RATIO = 0.25;

/** The row's damage budget, plus the legendary premium where it applies. */
export function damagePerRoundTarget(
  benchmark: CrBenchmark,
  isLegendary: boolean,
): number {
  return Math.round(
    benchmark.damagePerRound * (isLegendary ? LEGENDARY_DAMAGE_PREMIUM : 1),
  );
}

/**
 * The CR whose damage budget `damage` lands closest to. This is the offensive
 * half of the cross-check the guide recommends: read an offensive and a
 * defensive CR off the statblock, and if they disagree with the label, retune.
 */
export function crForDamagePerRound(
  damage: number,
  isLegendary: boolean,
): string | null {
  if (damage <= 0) return null;
  let closest: CrBenchmark | null = null;
  let nearest = Number.POSITIVE_INFINITY;
  for (const benchmark of CR_BENCHMARKS) {
    const distance = Math.abs(
      damagePerRoundTarget(benchmark, isLegendary) - damage,
    );
    // Strictly nearer, so a tie keeps the lower CR the table reached first.
    if (distance < nearest) {
      nearest = distance;
      closest = benchmark;
    }
  }
  return closest?.cr ?? null;
}

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
    | "name"
    | "traits"
    | "actions"
    | "is_legendary"
    | "legendary_actions"
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

  const estimate = estimateDamagePerRound(monster);
  const damageTarget = damagePerRoundTarget(benchmark, monster.is_legendary);

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
    damagePerRound: estimate && {
      ...compare(
        estimate.total,
        damageTarget,
        Math.round(damageTarget * DAMAGE_TOLERANCE_RATIO),
      ),
      estimate,
      suggestedCr: crForDamagePerRound(estimate.total, monster.is_legendary),
    },
  };
}
