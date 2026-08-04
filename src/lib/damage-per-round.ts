import {
  damageAverage,
  parseAttackArgs,
  parseMarkup,
  parseSaveArgs,
} from "./statblock-markup";
import type { MarkupContext } from "./statblock-markup";
import type { Monster } from "@/schema/monster-schema";

/**
 * Estimates how much damage a creature deals in a round it can repeat, read
 * straight out of the `{@…}` tags in its features. This is the offensive half
 * of the CR calculator, and it only became possible once every import path
 * normalized prose into tags (see `src/services/converters/prose-to-tags.ts`).
 *
 * Three conventions from the benchmark table shape the arithmetic, so that the
 * number here is directly comparable to `CrBenchmark.damagePerRound`:
 *
 * - Every attack hits and every save fails, so a tagged die is always worth
 *   its full average.
 * - An effect that catches two or more characters counts half, which is the
 *   table's own instruction for area damage.
 * - A recharge action doesn't set the total, because the budget describes what
 *   a creature puts out round after round.
 *
 * Damage the tags can't express is invisible here: spells cast by name carry
 * no dice, so casters read low.
 */

type Feature = Monster["actions"][number];

/**
 * The stats and features the estimate reads. `traits` is here only to find a
 * Multiattack: the editor's own Multiattack preset is typed as a trait, so
 * plenty of creatures keep theirs in that list. Trait damage itself is never
 * counted — traits are passive or conditional, not part of a normal round.
 */
export type DamageSource = Pick<
  Monster,
  | "ability_scores"
  | "cr"
  | "name"
  | "traits"
  | "actions"
  | "bonus_actions"
  | "reactions"
  | "is_legendary"
  | "legendary_actions"
>;

export interface DamageContribution {
  /** Feature name as written in the statblock. */
  name: string;
  /** How many times it lands in the round. */
  count: number;
  damage: number;
}

export interface DamagePerRoundEstimate {
  /** Total average damage across the round. */
  total: number;
  turn: Array<DamageContribution>;
  /** Legendary actions. Empty unless the creature is legendary. */
  legendary: Array<DamageContribution>;
  /**
   * Damage dealt outside the creature's turn — its best damaging reaction, one
   * per round. The guide is explicit that off-turn damage counts in the budget,
   * and one reaction per round is the same optimistic convention as "every
   * attack hits".
   */
  offTurn: Array<DamageContribution>;
}

/** Total damage of a set of contributions, counting repeats. */
function total(contributions: Array<DamageContribution>): number {
  return contributions.reduce((sum, c) => sum + c.count * c.damage, 0);
}

/** Total of the `{@damage}` tags nested inside a composite tag's slot. */
function nestedDamage(text: string, ctx: MarkupContext): number {
  if (!text.includes("{@damage")) return 0;
  let sum = 0;
  for (const segment of parseMarkup(text)) {
    if (segment.type === "tag" && segment.name === "damage") {
      sum += damageAverage(segment.args.split("|")[0], ctx);
    }
  }
  return sum;
}

/**
 * A save's target line when the effect catches the party rather than one
 * character — "each creature in a 90-foot Cone". The benchmark budgets are
 * per-character, so this damage is worth half of what it prints.
 */
const MULTI_TARGET_RE =
  /\beach\s+(?:other\s+)?(?:creature|enemy|ally|target)\b/i;

/**
 * Wording that puts a loose {@damage} outside the round: the Mummy's Rotting
 * Fist drains Hit Point maximum by 3d6 "every 24 hours". Only consulted for a
 * feature that already carries a composite tag holding its real damage —
 * without one, loose tags are all there is, which is how atomic-tagged
 * 2014-style prose writes its damage.
 */
const RIDER_RE =
  /\b(?:hit point maximum|every \d+ hours?|per (?:hour|day|week)|while (?:cursed|diseased|infected))\b/i;

interface FeatureReading {
  damage: number;
  /** Carries an `{@attack}` tag, so "makes two attacks" can mean this one. */
  isAttack: boolean;
}

function readFeature(description: string, ctx: MarkupContext): FeatureReading {
  let fromComposites = 0;
  let fromLooseDamage = 0;
  let hasComposite = false;
  let isAttack = false;

  for (const segment of parseMarkup(description)) {
    if (segment.type !== "tag") continue;
    if (segment.name === "attack") {
      hasComposite = true;
      isAttack = true;
      const fields = parseAttackArgs(segment.args);
      fromComposites +=
        damageAverage(fields.dice, ctx) +
        damageAverage(fields.dice2, ctx) +
        nestedDamage(fields.effect, ctx);
    } else if (segment.name === "save") {
      hasComposite = true;
      const fields = parseSaveArgs(segment.args);

      const dealt =
        damageAverage(fields.dice, ctx) + nestedDamage(fields.fail, ctx);
      fromComposites += MULTI_TARGET_RE.test(fields.target)
        ? Math.floor(dealt / 2)
        : dealt;
    } else if (segment.name === "damage") {
      fromLooseDamage += damageAverage(segment.args.split("|")[0], ctx);
    }
  }

  return {
    damage:
      hasComposite && RIDER_RE.test(description)
        ? fromComposites
        : fromComposites + fromLooseDamage,
    // The atomic route writes {@atkr}/{@hit} instead of a composite tag, so
    // treat those as attacks too.
    isAttack:
      isAttack || (!hasComposite && /\{@(atkr|atk|hit)\b/.test(description)),
  };
}

/** Average damage one feature deals, read from its `{@…}` tags. */
export function featureDamage(description: string, ctx: MarkupContext): number {
  return readFeature(description, ctx).damage;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function countOf(word: string): number {
  return (NUMBER_WORDS[word.toLowerCase()] ?? Number.parseInt(word, 10)) || 1;
}

/*
 * Multiattack and most legendary actions don't carry damage themselves; they
 * point at other actions by name. These three patterns cover every phrasing in
 * the 2024 SRD. Each capture is a single bounded lazy run — no nested
 * quantifiers — so none of them backtrack super-linearly on long prose.
 */

/** `makes three attacks, using Claw or Tail in any combination` */
const COMBINATION_RE =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:other\s+)?attacks?,?\s+using\s+([A-Z][^.]{0,80}?)\s+in any combination/g;

/** `makes two Tentacle attacks` / `makes two Javelin or Morningstar attacks` */
const NAMED_ATTACKS_RE =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+([A-Z][A-Za-z'’ -]{0,60}?)\s+attacks?\b/g;

/** `and uses Dreadful Glare` / `uses either Consume Memories or Dominate Mind` */
const USES_RE =
  /\buses\s+(?:either\s+)?([A-Z][A-Za-z'’ -]{0,60}?)(?=[.,]|\s+(?:if|and|to)\b|$)/g;

/**
 * `makes two attacks` — no action named at all, which is how the editor's own
 * Multiattack preset is worded. Only consulted when nothing above resolved, so
 * it never double-counts the phrasings that do name their attacks.
 */
const BARE_ATTACKS_RE =
  /\bmakes\s+(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+attacks?\b/;

type ActionEntry = DamageContribution & {
  isAttack: boolean;
  recharge: boolean;
};

type FeatureLookup = (name: string) => ActionEntry | null;

/** `Rotting Fist (Humanoid Form Only)` and `rotting fist` are the same action. */
function featureKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s*\([^()]*\)\s*$/, "");
}

/** The hardest-hitting of several named options, which the creature picks freely. */
function bestOption(
  names: Array<string>,
  lookup: FeatureLookup,
): ActionEntry | null {
  let best: ActionEntry | null = null;
  for (const name of names) {
    const feature = lookup(name);
    if (feature && feature.damage > (best?.damage ?? -1)) best = feature;
  }
  return best;
}

/** Drop the internal flag: the breakdown is a plain list of contributions. */
function contribution(entry: ActionEntry, count: number): DamageContribution {
  return { name: entry.name, count, damage: entry.damage };
}

/**
 * Damage a feature delegates to other actions by name. Options joined by
 * "or"/"and" are a free choice, so the best one is assumed. Phrasings this
 * can't read (the Hydra's "as many Bite attacks as it has heads") yield
 * nothing, and the caller falls back to the creature's best single action.
 *
 * `fallback` covers the opposite problem — text that gives a count but names
 * nothing ("makes two attacks") — by repeating the creature's best attack.
 */
function referencedDamage(
  description: string,
  lookup: FeatureLookup,
  fallback: ActionEntry | null,
): Array<DamageContribution> {
  const found: Array<DamageContribution> = [];

  for (const match of description.matchAll(COMBINATION_RE)) {
    const best = bestOption(match[2].split(/\s+(?:or|and)\s+|,\s*/), lookup);
    if (best) found.push(contribution(best, countOf(match[1])));
  }
  for (const match of description.matchAll(NAMED_ATTACKS_RE)) {
    const best = bestOption(match[2].split(/\s+or\s+/), lookup);
    if (best) found.push(contribution(best, countOf(match[1])));
  }
  for (const match of description.matchAll(USES_RE)) {
    const best = bestOption(match[1].split(/\s+or\s+/), lookup);
    if (best) found.push(contribution(best, 1));
  }

  if (found.length === 0 && fallback) {
    const bare = BARE_ATTACKS_RE.exec(description);
    if (bare) found.push(contribution(fallback, countOf(bare[1])));
  }
  return found;
}

const MULTIATTACK_RE = /^multiattack\b/i;

/**
 * A recharge limit, which imported statblocks write into the action's name
 * (`Fire Breath (Recharge 5-6)`) and hand-authored ones write as a tag in the
 * description.
 */
const RECHARGE_RE = /\(\s*recharge|\{@recharge\b/i;

/**
 * Damage one feature is worth on its own terms: its own tags plus whatever it
 * delegates to by name. Used for the one bonus action and one reaction a round
 * allows, and for each legendary option.
 */
function readOption(
  feature: Feature,
  ctx: MarkupContext,
  lookup: FeatureLookup,
  fallback: ActionEntry | null,
): DamageContribution {
  return {
    name: feature.name,
    count: 1,
    damage:
      featureDamage(feature.description, ctx) +
      total(referencedDamage(feature.description, lookup, fallback)),
  };
}

/**
 * The hardest-hitting feature in a list, or `null` when none of them deal
 * damage. Reference wording counts here as much as it does in a Multiattack:
 * plenty of bonus actions and reactions just say "makes one Bite attack".
 */
function bestFeature(
  features: Array<Feature>,
  ctx: MarkupContext,
  lookup: FeatureLookup,
  fallback: ActionEntry | null,
): DamageContribution | null {
  let best: DamageContribution | null = null;
  for (const feature of features) {
    const option = readOption(feature, ctx, lookup, fallback);
    if (option.damage > (best?.damage ?? 0)) best = option;
  }
  return best;
}

/** 2024 statblocks grant three legendary action uses per round. */
const LEGENDARY_USES_PER_ROUND = 3;

/** The wording 2024 statblocks use to cap an option at one use per round. */
const ONCE_PER_ROUND_RE = /again until the start of its next turn/i;

/** `Wing Attack (Costs 2 Actions)` — 2014-era imports price options in the name. */
const LEGENDARY_COST_RE = /\(\s*costs?\s+(\d+)\s+actions?\s*\)/i;

interface LegendaryOption {
  option: DamageContribution;
  /** Legendary uses one use of this option spends. */
  cost: number;
  /** Capped at one use per round by the statblock's own wording. */
  limited: boolean;
}

function legendaryCost(name: string): number {
  const match = LEGENDARY_COST_RE.exec(name);
  const cost = match ? Number.parseInt(match[1], 10) : 1;
  return cost > 0 ? cost : 1;
}

/**
 * The most damage `budget` legendary uses can buy. Each option is considered
 * once, taken as many times as its cost and its per-round cap allow — a tiny
 * knapsack rather than "three of the biggest", so a two-action option can't be
 * spent three times in a three-use round.
 */
function bestSpend(
  options: Array<LegendaryOption>,
  budget: number,
  from = 0,
): Array<DamageContribution> {
  let best: Array<DamageContribution> = [];
  for (let index = from; index < options.length; index++) {
    const { option, cost, limited } = options[index];
    const most = limited ? 1 : Math.floor(budget / cost);
    for (let uses = 1; uses <= most && uses * cost <= budget; uses++) {
      const round = [
        { ...option, count: uses },
        ...bestSpend(options, budget - uses * cost, index + 1),
      ];
      if (total(round) > total(best)) best = round;
    }
  }
  return best;
}

/** What the legendary actions add each round, within the three uses. */
function legendaryRound(
  actions: Array<Feature>,
  ctx: MarkupContext,
  lookup: FeatureLookup,
  fallback: ActionEntry | null,
): Array<DamageContribution> {
  const options: Array<LegendaryOption> = actions
    .map((action) => ({
      option: readOption(action, ctx, lookup, fallback),
      cost: legendaryCost(action.name),
      limited: ONCE_PER_ROUND_RE.test(action.description),
    }))
    .filter((entry) => entry.option.damage > 0);

  return bestSpend(options, LEGENDARY_USES_PER_ROUND).sort(
    (a, b) => b.damage - a.damage,
  );
}

/**
 * Estimate the creature's damage in its best round, or `null` when no `{@…}`
 * damage tag was found. Returning `null` matters: a statblock written as plain
 * prose isn't a creature that deals no damage, it's one whose damage we can't
 * read, and it must not be told its output is low.
 */
export function estimateDamagePerRound(
  monster: DamageSource,
): DamagePerRoundEstimate | null {
  const ctx: MarkupContext = {
    ability_scores: monster.ability_scores,
    cr: monster.cr,
    name: monster.name,
  };

  const byKey = new Map<string, ActionEntry>();
  for (const action of monster.actions) {
    if (MULTIATTACK_RE.test(action.name)) continue;
    const reading = readFeature(action.description, ctx);
    const key = featureKey(action.name);
    const entry: ActionEntry = {
      name: action.name,
      count: 1,
      damage: reading.damage,
      isAttack: reading.isAttack,
      recharge: RECHARGE_RE.test(`${action.name} ${action.description}`),
    };
    // Two actions can normalize to one key — a shapechanger's "Bite (Beast
    // Form Only)" and "Bite (Humanoid Form Only)". Keep the harder hitter
    // rather than whichever happened to be listed last.
    const existing = byKey.get(key);
    if (!existing || entry.damage > existing.damage) byKey.set(key, entry);
  }
  const lookup: FeatureLookup = (name) => byKey.get(featureKey(name)) ?? null;

  // A recharge action is left out of the every-round total: the budget it is
  // measured against describes sustained output, and a breath weapon would
  // otherwise set the number for a round the creature can rarely repeat. It
  // still counts when a Multiattack names it outright.
  let bestSingle: ActionEntry | null = null;
  let bestAttack: ActionEntry | null = null;
  for (const action of byKey.values()) {
    if (action.recharge) continue;
    if (action.damage > (bestSingle?.damage ?? 0)) bestSingle = action;
    if (action.isAttack && action.damage > (bestAttack?.damage ?? 0)) {
      bestAttack = action;
    }
  }
  // Unless the recharge action is the only thing the creature does. Reading
  // its damage overstates the round; reading nothing at all is worse.
  if (!bestSingle) {
    for (const action of byKey.values()) {
      if (action.damage > (bestSingle?.damage ?? 0)) bestSingle = action;
    }
  }
  // "makes two attacks" means two swings, so prefer a real attack over a big
  // area action that happens to be the creature's highest single number.
  const anonymousAttack = bestAttack ?? bestSingle;

  // The Multiattack is usually an action, but the editor's preset files it as
  // a trait, so honour both rather than silently missing half the creatures.
  const multiattack =
    monster.actions.find((a) => MULTIATTACK_RE.test(a.name)) ??
    monster.traits.find((t) => MULTIATTACK_RE.test(t.name));

  const combined: Array<DamageContribution> = [];
  if (multiattack) {
    combined.push(
      ...referencedDamage(multiattack.description, lookup, anonymousAttack),
    );
    // Rare, but a hand-written Multiattack may hold an attack tag of its own.
    const own = featureDamage(multiattack.description, ctx);
    if (own > 0)
      combined.push({ name: multiattack.name, count: 1, damage: own });
  }

  // The round is the Multiattack, unless one big action beats it — a Crush or
  // a Swallow that outdamages the claws the creature would otherwise use.
  const single = bestSingle ? [contribution(bestSingle, 1)] : [];
  const turn = (total(combined) >= total(single) ? combined : single).filter(
    // A Multiattack often names a rider with no damage of its own ("and uses
    // Dreadful Glare"); it belongs in the round but not in a damage breakdown.
    (entry) => entry.damage > 0,
  );

  const legendary = monster.is_legendary
    ? legendaryRound(monster.legendary_actions, ctx, lookup, anonymousAttack)
    : [];

  // One bonus action and one reaction per round, each the creature's best.
  const bonus = bestFeature(
    monster.bonus_actions,
    ctx,
    lookup,
    anonymousAttack,
  );
  if (bonus) turn.push(bonus);
  const reaction = bestFeature(monster.reactions, ctx, lookup, anonymousAttack);
  const offTurn = reaction ? [reaction] : [];

  const damage = total(turn) + total(legendary) + total(offTurn);
  return damage > 0 ? { total: damage, turn, legendary, offTurn } : null;
}
