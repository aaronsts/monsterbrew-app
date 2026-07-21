import { calculateStatBonus } from "./utils";
import type { Monster } from "@/schema/monster-schema";

/**
 * Monsterbrew reuses 5eTools' `{@…}` tag syntax as its native statblock markup,
 * so imported bestiary text is already in our format and needs no conversion.
 *
 * On top of that we add ONE extension: where 5eTools always writes a number
 * (`{@hit 3}`, `{@dc 15}`, `{@damage 2d8 + 1}`), Monsterbrew also accepts an
 * ability keyword (`{@hit str}`, `{@dc con}`, `{@damage 2d8 + str}`). A keyword
 * means "derive this from the creature's stats and recompute it live in the
 * statblock". Because 5eTools never puts a word in that slot, the two are
 * unambiguous and fully backward compatible.
 *
 * `resolveMarkup` turns a description string into display text and is the single
 * source of truth used by every render/export path (statblock, editor preview),
 * regardless of where the text came from (5eTools import, SRD, or hand-typed).
 */

/** The stats `resolveMarkup` needs to compute stat-linked values. */
export type MarkupContext = Pick<Monster, "ability_scores" | "cr">;

export interface TextSegment {
  type: "text";
  value: string;
}

export interface TagSegment {
  type: "tag";
  /** Tag name without the leading `@`, e.g. `hit`, `damage`, `atkr`. */
  name: string;
  /** Everything after the name, trimmed (may contain `|` separators). */
  args: string;
  /** The original `{@…}` text, used as the fallback when a tag can't resolve. */
  raw: string;
}

export type Segment = TextSegment | TagSegment;

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
type Ability = (typeof ABILITIES)[number];
const ABILITY_SET = new Set<string>(ABILITIES);

const ABILITY_NAMES: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const TAG_RE = /\{@(\w+)(?:\s+([^}]*))?\}/g;

/**
 * 5eTools writes an attack's average damage as literal text wrapping the tag:
 * `{@h}10 ({@damage 2d8 + 1})`. Our renderer computes and shows the average
 * itself, so we strip the redundant literal `<number> ( … )` wrapper first to
 * avoid doubling it. Hand-typed content (which never has the literal average)
 * is unaffected.
 */
const REDUNDANT_AVERAGE_RE = /\d+\s*\(\s*(\{@damage\b[^}]*\})\s*\)/g;

function formatMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function isAbility(value: string): value is Ability {
  return ABILITY_SET.has(value.toLowerCase());
}

function abilityMod(ctx: MarkupContext, ability: string): number {
  return calculateStatBonus(
    ctx.ability_scores[ability.toLowerCase() as Ability],
  );
}

/** Split a description into literal-text and `{@…}` tag segments. */
export function parseMarkup(text: string): Array<Segment> {
  const segments: Array<Segment> = [];
  let last = 0;
  for (const match of text.matchAll(TAG_RE)) {
    const index = match.index ?? 0;
    if (index > last) {
      segments.push({ type: "text", value: text.slice(last, index) });
    }
    segments.push({
      type: "tag",
      name: match[1],
      args: (match[2] ?? "").trim(),
      raw: match[0],
    });
    last = index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }
  return segments;
}

/**
 * Average of a dice expression like `2d8 + 4`, `4d12 + 10`, `12d12` or `1d6`.
 * Ability keywords must already be resolved to numbers. Floored, min 1.
 */
function averageDice(expr: string): number {
  let total = 0;
  const terms = expr.match(/[+-]?\s*\d*d\d+|[+-]?\s*\d+/g) ?? [];
  for (const rawTerm of terms) {
    const term = rawTerm.replace(/\s+/g, "");
    const dice = term.match(/^([+-]?\d*)d(\d+)$/);
    if (dice) {
      const count = Number.parseInt(
        dice[1] === "" || dice[1] === "+" ? "1" : dice[1],
        10,
      );
      const sides = Number.parseInt(dice[2], 10);
      total += count * ((sides + 1) / 2);
    } else {
      total += Number.parseInt(term, 10) || 0;
    }
  }
  return Math.max(1, Math.floor(total));
}

/** Replace ability keywords inside a dice expression with their signed modifier. */
function resolveDiceAbilities(expr: string, ctx: MarkupContext): string {
  return expr.replace(/[a-z]{3}/gi, (word) =>
    isAbility(word) ? `${abilityMod(ctx, word)}` : word,
  );
}

/**
 * Tidy operator/sign sequences left after an ability keyword resolves to a
 * negative or zero modifier: `2d8 + -1` -> `2d8 - 1`, `2d8 + 0` -> `2d8`.
 */
function normalizeSigns(expr: string): string {
  return expr
    .replace(/\+\s*-\s*/g, "- ")
    .replace(/-\s*-\s*/g, "+ ")
    .replace(/([+-])\s*0\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Strip a `|SOURCE` suffix and honour an explicit `|display` override. */
function referenceText(args: string): string {
  const parts = args.split("|");
  // 5eTools order: {@tag name|source|displayText}
  return (parts[2] || parts[0] || "").trim();
}

function attackRoll(args: string, weaponOrSpell: string | null): string {
  const kinds = args
    .split(",")
    .map((k) => (k.trim()[0] === "r" ? "Ranged" : "Melee"));
  const prefix = kinds.length > 1 ? "Melee or Ranged" : kinds[0] || "Melee";
  const suffix = weaponOrSpell ? `${weaponOrSpell} Attack` : "Attack Roll";
  return `${prefix} ${suffix}:`;
}

/** Resolve a single tag to its display text. Never throws. */
export function resolveTag(tag: TagSegment, ctx: MarkupContext): string {
  const { name, args, raw } = tag;
  const pb = ctx.cr.proficiency_bonus || 0;

  switch (name) {
    case "atkr":
      // 2024: {@atkr m} / {@atkr r} / {@atkr m,r}
      return attackRoll(args, null);
    case "atk": {
      // 2014 legacy: {@atk mw} (melee weapon) / rw / ms / rs
      const isSpell = /s/.test(args);
      return attackRoll(args, isSpell ? "Spell" : "Weapon");
    }
    case "hit":
      return isAbility(args)
        ? formatMod(abilityMod(ctx, args) + pb)
        : formatMod(Number.parseInt(args, 10) || 0);
    case "h":
      return "Hit: ";
    case "dc":
      return isAbility(args)
        ? `DC ${8 + pb + abilityMod(ctx, args)}`
        : `DC ${Number.parseInt(args, 10) || 0}`;
    case "damage": {
      const expr = normalizeSigns(resolveDiceAbilities(args, ctx));
      return `${averageDice(expr)} (${expr})`;
    }
    case "dice":
    case "scaledice":
      // Inline dice: show the (ability-resolved) expression only, no average.
      return resolveDiceAbilities(referenceText(args), ctx);
    case "actSave": {
      const key = args.toLowerCase();
      const label = isAbility(key) ? ABILITY_NAMES[key] : args;
      return `${label} Saving Throw:`;
    }
    case "actSaveFail":
      return "Failure:";
    case "actSaveSuccess":
      return "Success:";
    case "actSaveSuccessOrFail":
      return "Failure or Success:";
    case "recharge": {
      // {@recharge 5} -> "(Recharge 5–6)"; {@recharge}/{@recharge 6} -> only on a 6.
      const low = Number.parseInt(args, 10);
      return low >= 2 && low < 6 ? `(Recharge ${low}–6)` : "(Recharge 6)";
    }
    case "i":
    case "italic":
      return `*${referenceText(args)}*`;
    case "b":
    case "bold":
      return `**${referenceText(args)}**`;
    // Reference tags — keep the label, drop the |SOURCE.
    case "spell":
    case "condition":
    case "status":
    case "item":
    case "creature":
    case "variantrule":
    case "sense":
    case "skill":
    case "action":
    case "book":
    case "filter":
    case "quickref":
    case "hazard":
    case "disease":
    case "damage_type":
    case "note":
      return referenceText(args);
    default:
      // Unknown tag: surface its text if any, otherwise the raw tag verbatim,
      // so the statblock never blanks out or leaks stray braces silently.
      return args ? referenceText(args) : raw;
  }
}

/**
 * Resolve every `{@…}` tag in `text` to display text using the creature's
 * stats. Plain descriptions with no tags pass through unchanged.
 */
export function resolveMarkup(text: string, ctx: MarkupContext): string {
  if (!text || !text.includes("{@")) return text;
  const normalised = text.replace(REDUNDANT_AVERAGE_RE, "$1");
  return parseMarkup(normalised)
    .map((seg) => (seg.type === "text" ? seg.value : resolveTag(seg, ctx)))
    .join("");
}
