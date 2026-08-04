import {
  damageAverage,
  parseAttackArgs,
  parseMarkup,
  parseSaveArgs,
} from "./statblock-markup";
import type { MarkupContext } from "./statblock-markup";
import type { Monster } from "@/schema/monster-schema";

/**
 * Estimates how much damage a creature deals in its best round, read straight
 * out of the `{@…}` tags in its features. This is the offensive half of the CR
 * calculator, and it only became possible once every import path normalized
 * prose into tags (see `src/services/converters/prose-to-tags.ts`).
 *
 * It follows the measurement convention behind the published damage-per-round
 * baselines — every attack hits and every save fails — so a tagged die is
 * always worth its full average. Damage the tags can't express is invisible
 * here: spells cast by name carry no dice, so casters read low.
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
  /** Average damage for one use. */
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
        damageAverage(fields.dice, ctx) + damageAverage(fields.dice2, ctx);
    } else if (segment.name === "save") {
      hasComposite = true;
      const fields = parseSaveArgs(segment.args);
      fromComposites += damageAverage(fields.dice, ctx);
      // Some 2024 statblocks carry the whole failure damage in the failure
      // text rather than the dice slot (the Vampire's Bite).
      fromComposites += nestedDamage(fields.fail, ctx);
    } else if (segment.name === "damage") {
      fromLooseDamage += damageAverage(segment.args.split("|")[0], ctx);
    }
  }

  // A loose {@damage} next to an {@attack}/{@save} line is a rider, not part
  // of the round: the Mummy's Rotting Fist drains Hit Point maximum by 3d6
  // "every 24 hours". Loose tags only count when they are all there is, which
  // is how atomic-tagged 2014-style prose writes its damage.
  return {
    damage: hasComposite ? fromComposites : fromLooseDamage,
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

type ActionEntry = DamageContribution & { isAttack: boolean };

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
 * The hardest-hitting feature in a list, or `null` when none of them deal
 * damage. Used for the one bonus action and one reaction a round allows.
 */
function bestFeature(
  features: Array<Feature>,
  ctx: MarkupContext,
): DamageContribution | null {
  let best: DamageContribution | null = null;
  for (const feature of features) {
    const damage = featureDamage(feature.description, ctx);
    if (damage > (best?.damage ?? 0)) {
      best = { name: feature.name, count: 1, damage };
    }
  }
  return best;
}

/** 2024 statblocks grant three legendary action uses per round. */
const LEGENDARY_USES_PER_ROUND = 3;

/** The wording 2024 statblocks use to cap an option at one use per round. */
const ONCE_PER_ROUND_RE = /again until the start of its next turn/i;

/**
 * What the legendary actions add each round: the best mix of once-per-round
 * options and repeats of the strongest unlimited one, within the three uses.
 */
function legendaryRound(
  actions: Array<Feature>,
  ctx: MarkupContext,
  lookup: FeatureLookup,
  fallback: ActionEntry | null,
): Array<DamageContribution> {
  const options = actions.map((action) => ({
    option: {
      name: action.name,
      count: 1,
      damage:
        featureDamage(action.description, ctx) +
        total(referencedDamage(action.description, lookup, fallback)),
    },
    limited: ONCE_PER_ROUND_RE.test(action.description),
  }));

  let repeatable: DamageContribution | null = null;
  for (const { option, limited } of options) {
    if (!limited && option.damage > (repeatable?.damage ?? 0))
      repeatable = option;
  }
  const limited = options
    .filter((o) => o.limited)
    .map((o) => o.option)
    .sort((a, b) => b.damage - a.damage);

  let best: Array<DamageContribution> = [];
  const mostLimited = Math.min(LEGENDARY_USES_PER_ROUND, limited.length);
  for (let taken = 0; taken <= mostLimited; taken++) {
    const repeats = LEGENDARY_USES_PER_ROUND - taken;
    const round =
      repeatable && repeats > 0
        ? [...limited.slice(0, taken), { ...repeatable, count: repeats }]
        : limited.slice(0, taken);
    if (total(round) > total(best)) best = round;
  }
  return best.filter((contribution) => contribution.damage > 0);
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
    byKey.set(featureKey(action.name), {
      name: action.name,
      count: 1,
      damage: reading.damage,
      isAttack: reading.isAttack,
    });
  }
  const lookup: FeatureLookup = (name) => byKey.get(featureKey(name)) ?? null;

  let bestSingle: ActionEntry | null = null;
  let bestAttack: ActionEntry | null = null;
  for (const action of byKey.values()) {
    if (action.damage > (bestSingle?.damage ?? 0)) bestSingle = action;
    if (action.isAttack && action.damage > (bestAttack?.damage ?? 0)) {
      bestAttack = action;
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

  // The best round is the Multiattack, unless one big action beats it — a
  // dragon's breath weapon outdamages the claws it would otherwise use.
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
  const bonus = bestFeature(monster.bonus_actions, ctx);
  if (bonus) turn.push(bonus);
  const reaction = bestFeature(monster.reactions, ctx);
  const offTurn = reaction ? [reaction] : [];

  const damage = total(turn) + total(legendary) + total(offTurn);
  return damage > 0 ? { total: damage, turn, legendary, offTurn } : null;
}
