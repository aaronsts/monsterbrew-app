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
  start: number;
  end: number;
}

export interface TagSegment {
  type: "tag";
  /** Tag name without the leading `@`, e.g. `hit`, `damage`, `atkr`. */
  name: string;
  /** Everything after the name, trimmed (may contain `|` separators). */
  args: string;
  /** The original `{@…}` text, used as the fallback when a tag can't resolve. */
  raw: string;
  /** Start index (inclusive) into the source string. */
  start: number;
  /** End index (exclusive) into the source string. */
  end: number;
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

function isWordChar(code: number): boolean {
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 95 // _
  );
}

/**
 * Split a raw balanced tag (`{@name args}`) into name and args. A character
 * scan instead of `/^\{@(\w+)([\s\S]*)\}$/` — that regex's adjacent
 * overlapping quantifiers backtrack super-linearly on long inputs.
 */
function parseTagHead(raw: string): { name: string; args: string } | null {
  let i = 2; // skip "{@"
  while (i < raw.length - 1 && isWordChar(raw.charCodeAt(i))) i++;
  if (i === 2) return null; // "{@}" or "{@ …}": no tag name
  return { name: raw.slice(2, i), args: raw.slice(i, -1).trim() };
}

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

/** Index of the `}` that closes the `{` at `start`, or -1 if unbalanced. */
function findTagEnd(text: string, start: number): number {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

/**
 * Split a description into literal-text and `{@…}` tag segments. Braces are
 * counted, not regex-matched, so a tag's args may themselves contain tags
 * (e.g. a composite `{@save …|the target is {@condition prone}}`). Each
 * segment carries its `start`/`end` source offsets so editors can splice a
 * rewritten tag back into the exact spot, even among identical tags.
 */
export function parseMarkup(text: string): Array<Segment> {
  const segments: Array<Segment> = [];
  let last = 0;
  let i = 0;
  while (i < text.length) {
    if (text[i] === "{" && text[i + 1] === "@") {
      const close = findTagEnd(text, i);
      const raw = close === -1 ? "" : text.slice(i, close + 1);
      const head = raw ? parseTagHead(raw) : null;
      if (head) {
        if (i > last) {
          segments.push({
            type: "text",
            value: text.slice(last, i),
            start: last,
            end: i,
          });
        }
        segments.push({
          type: "tag",
          name: head.name,
          args: head.args,
          raw,
          start: i,
          end: close + 1,
        });
        last = close + 1;
        i = close + 1;
        continue;
      }
    }
    i++;
  }
  if (last < text.length) {
    segments.push({
      type: "text",
      value: text.slice(last),
      start: last,
      end: text.length,
    });
  }
  return segments;
}

/**
 * Average of a dice expression like `2d8 + 4`, `4d12 + 10`, `12d12` or `1d6`.
 * Ability keywords must already be resolved to numbers. Floored, min 1.
 */
function averageDice(expr: string): number {
  let total = 0;
  // Compact once up front: without embedded whitespace the term regexes have
  // no adjacent variable-width quantifiers left to backtrack over.
  const compact = expr.replace(/\s+/g, "");
  const terms = compact.match(/[+-]?\d*d\d+|[+-]?\d+/g) ?? [];
  for (const term of terms) {
    const dice = /^([+-]?\d*)d(\d+)$/.exec(term);
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
  // Word boundaries: only whole three-letter words are candidates, so the
  // callback no longer fires for every 3-letter run of longer words (and a
  // "str" inside e.g. "strength" is left alone).
  return expr.replace(/\b[a-z]{3}\b/gi, (word) =>
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/*
 * Composite line tags — `{@attack …}` and `{@save …}`.
 *
 * One tag renders a whole 2024-SRD-style attack or saving-throw line. The
 * pipe-separated arg order below is a STORED FORMAT (saved creature
 * descriptions contain it): never reorder or remove slots; only append new
 * optional ones at the end. `parse*Args`/`serialize*Args` are the single
 * grammar implementation, shared by the resolvers here and the token-editor
 * UI, and round-trip: serialize(parse(args)) is stable.
 */

/** `{@attack <kind>|<hit>|<reach>|<dice>|<type>}` — kind + hit required. */
export interface AttackFields {
  /** `m`, `r`, or `m,r`. */
  kind: string;
  /** Ability keyword (`str`) or flat bonus (`7`). */
  hit: string;
  /**
   * Numbers only; the `reach`/`range` wording and ` ft.` come from `kind`.
   * `m` → `5`; `r` → `30/120` (normal/long); `m,r` → `5;30/120`.
   */
  reach: string;
  /** Dice expression, may embed ability keywords (`2d8+str`). */
  dice: string;
  /** Damage type (`slashing`); capitalized on output. */
  type: string;
}

/** `{@save <ability>|<dc>|<dice>|<type>|<onSave>}` — ability + dc required. */
export interface SaveFields {
  /** Tested ability (`dex`). */
  ability: string;
  /** Ability keyword (`con`, meaning 8 + PB + mod) or flat DC (`15`). */
  dc: string;
  /** Failure damage dice (`3d6`). */
  dice: string;
  /** Failure damage type (`fire`). */
  type: string;
  /** `half` / `none` / custom success text. Defaults to `half` when dice set. */
  onSave: string;
}

/**
 * Split composite args on top-level `|` only — a nested tag may itself
 * contain pipes (`the target is {@condition prone|XPHB}`).
 */
function splitArgs(args: string, count: number): Array<string> {
  const parts: Array<string> = [];
  let current = "";
  let depth = 0;
  for (const ch of args) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (ch === "|" && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  while (parts.length < count) parts.push("");
  return parts;
}

export function parseAttackArgs(args: string): AttackFields {
  const [kind, hit, reach, dice, type] = splitArgs(args, 5);
  return { kind, hit, reach, dice, type };
}

export function serializeAttackArgs(fields: AttackFields): string {
  const parts = [
    fields.kind,
    fields.hit,
    fields.reach,
    fields.dice,
    fields.type,
  ].map((p) => p.trim());
  while (parts.length > 2 && parts[parts.length - 1] === "") parts.pop();
  return parts.join("|");
}

export function parseSaveArgs(args: string): SaveFields {
  const [ability, dc, dice, type, onSave] = splitArgs(args, 5);
  return { ability, dc, dice, type, onSave };
}

export function serializeSaveArgs(fields: SaveFields): string {
  const parts = [
    fields.ability,
    fields.dc,
    fields.dice,
    fields.type,
    fields.onSave,
  ].map((p) => p.trim());
  while (parts.length > 2 && parts[parts.length - 1] === "") parts.pop();
  return parts.join("|");
}

/** Flat-or-ability attack bonus: `str` → mod + PB, `7` → 7 (mirrors `@hit`). */
function hitBonus(value: string, ctx: MarkupContext): number {
  const pb = ctx.cr.proficiency_bonus || 0;
  return isAbility(value)
    ? abilityMod(ctx, value) + pb
    : Number.parseInt(value, 10) || 0;
}

/** Flat-or-ability DC: `con` → 8 + PB + mod, `15` → 15 (mirrors `@dc`). */
function dcValue(value: string, ctx: MarkupContext): number {
  const pb = ctx.cr.proficiency_bonus || 0;
  return isAbility(value)
    ? 8 + pb + abilityMod(ctx, value)
    : Number.parseInt(value, 10) || 0;
}

/** The `, reach 5 ft.` / `, range 30/120 ft.` clause, worded from `kind`. */
function attackDistance(kind: string, reach: string): string {
  if (!reach) return "";
  const melee = /m/.test(kind);
  const ranged = /r/.test(kind);
  if (melee && ranged) {
    const [near = "", far = ""] = reach.split(";").map((p) => p.trim());
    const clauses = [];
    if (near) clauses.push(`reach ${near} ft.`);
    if (far) clauses.push(`range ${far} ft.`);
    return clauses.join(" or ");
  }
  return ranged ? `range ${reach} ft.` : `reach ${reach} ft.`;
}

/** `13 (2d8 + 4)` with abilities resolved, or `""` for no dice. */
function damageClause(dice: string, ctx: MarkupContext): string {
  if (!dice) return "";
  const expr = normalizeSigns(resolveDiceAbilities(dice, ctx))
    // Uniform operator spacing so `2d8+str` renders as `2d8 + 4`.
    .replace(/\s*([+-])\s*/g, " $1 ")
    .trim();
  return `${averageDice(expr)} (${expr})`;
}

/** e.g. `Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Slashing damage.` */
function resolveAttack(args: string, ctx: MarkupContext): string {
  const f = parseAttackArgs(args);
  let out = attackRoll(f.kind || "m", null);
  if (f.hit) out += ` ${formatMod(hitBonus(f.hit, ctx))}`;
  const distance = attackDistance(f.kind, f.reach);
  if (distance) out += `${f.hit ? "," : ""} ${distance}`;
  else if (f.hit) out += ".";
  const damage = damageClause(f.dice, ctx);
  if (damage) {
    out += ` Hit: ${damage}${f.type ? ` ${capitalize(f.type)}` : ""} damage.`;
  }
  return out;
}

/** e.g. `Dexterity Saving Throw: DC 13. Failure: 10 (3d6) Fire damage. Success: Half damage.` */
function resolveSave(args: string, ctx: MarkupContext): string {
  const f = parseSaveArgs(args);
  const key = f.ability.toLowerCase();
  const label = isAbility(key) ? ABILITY_NAMES[key] : f.ability;
  let out = label ? `${label} Saving Throw:` : "Saving Throw:";
  if (f.dc) out += ` DC ${dcValue(f.dc, ctx)}.`;
  const damage = damageClause(f.dice, ctx);
  if (damage) {
    out += ` Failure: ${damage}${f.type ? ` ${capitalize(f.type)}` : ""} damage.`;
  }
  const onSave = f.onSave || (damage ? "half" : "");
  if (onSave === "half") {
    out += " Success: Half damage.";
  } else if (onSave && onSave !== "none") {
    // Custom success text may itself contain tags ({@condition prone}, …).
    const custom = resolveMarkup(onSave, ctx);
    out += ` Success: ${custom}${/[.!?]$/.test(custom) ? "" : "."}`;
  }
  return out;
}

/** Every tag name `resolveTag` has a case for — keep in sync with its switch. */
export const KNOWN_TAG_NAMES: ReadonlySet<string> = new Set([
  "atkr",
  "atk",
  "hit",
  "h",
  "dc",
  "damage",
  "attack",
  "save",
  "dice",
  "scaledice",
  "actSave",
  "actSaveFail",
  "actSaveSuccess",
  "actSaveSuccessOrFail",
  "recharge",
  "i",
  "italic",
  "b",
  "bold",
  "spell",
  "condition",
  "status",
  "item",
  "creature",
  "variantrule",
  "sense",
  "skill",
  "action",
  "book",
  "filter",
  "quickref",
  "hazard",
  "disease",
  "damage_type",
  "note",
]);

/**
 * Human-readable problems with an `{@attack}` tag's args (empty = valid).
 * The resolvers never throw — these power editor diagnostics instead.
 */
export function validateAttackArgs(args: string): Array<string> {
  const f = parseAttackArgs(args);
  const problems: Array<string> = [];
  if (!f.kind) {
    problems.push("missing attack kind (m, r, or m,r)");
  } else if (
    !f.kind.split(",").every((k) => k.trim() === "m" || k.trim() === "r")
  ) {
    problems.push(`unknown attack kind "${f.kind}" (use m, r, or m,r)`);
  }
  if (!f.hit) {
    problems.push("missing to-hit (an ability like str, or a number)");
  } else if (!isAbility(f.hit) && !/^[+-]?\d+$/.test(f.hit)) {
    problems.push(`to-hit "${f.hit}" is neither an ability nor a number`);
  }
  return problems;
}

/** Human-readable problems with a `{@save}` tag's args (empty = valid). */
export function validateSaveArgs(args: string): Array<string> {
  const f = parseSaveArgs(args);
  const problems: Array<string> = [];
  if (!f.ability) {
    problems.push("missing saving-throw ability (str/dex/con/int/wis/cha)");
  } else if (!isAbility(f.ability)) {
    problems.push(`unknown ability "${f.ability}"`);
  }
  if (!f.dc) {
    problems.push("missing DC (an ability like con, or a number)");
  } else if (!isAbility(f.dc) && !/^\d+$/.test(f.dc)) {
    problems.push(`DC "${f.dc}" is neither an ability nor a number`);
  }
  return problems;
}

/** Resolve a single tag to its display text. Never throws. */
export function resolveTag(tag: TagSegment, ctx: MarkupContext): string {
  const { name, args, raw } = tag;

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
      return formatMod(hitBonus(args, ctx));
    case "h":
      return "Hit: ";
    case "dc":
      return `DC ${dcValue(args, ctx)}`;
    case "damage": {
      // Optional structured damage type: {@damage 2d8 + str|slashing}.
      const [dice, type = ""] = splitArgs(args, 2);
      const base = damageClause(dice, ctx);
      return type ? `${base} ${capitalize(type)} damage` : base;
    }
    case "attack":
      // Composite full attack line; see AttackFields for the grammar.
      return args ? resolveAttack(args, ctx) : raw;
    case "save":
      // Composite full saving-throw line; see SaveFields for the grammar.
      return args ? resolveSave(args, ctx) : raw;
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
