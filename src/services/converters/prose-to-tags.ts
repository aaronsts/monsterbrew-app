import type {
  AttackFields,
  MarkupContext,
  SaveFields,
} from "@/lib/statblock-markup";
import type { Monster } from "@/schema/monster-schema";
import {
  dcValue,
  hitBonus,
  resolveMarkup,
  serializeAttackArgs,
  serializeSaveArgs,
} from "@/lib/statblock-markup";

/**
 * Convert plain statblock prose into Monsterbrew's `{@…}` markup
 * (docs/design/attack-tokens.md).
 *
 * Every rewrite is verified by resolution: a candidate tag replaces prose only
 * when `resolveMarkup(candidate)` reproduces the original text byte for byte.
 * The one deliberate exception is the official `Hit:` label, which the SRD
 * dataset omits and `resolveAttack` adds (see the composite-tag note in
 * statblock-markup.ts) — a composite attack line gains exactly that label and
 * nothing else. Lines the composite grammar can't hold fall back to atomic
 * tags (`{@atkr} {@hit}` / `{@dc}` / `{@damage}`), and anything still
 * unverifiable passes through untouched. 2014-style lines always take the
 * atomic route (`{@atk mw} {@hit str}` / `{@dc wis}` / `{@damage}`)
 */

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
type Ability = (typeof ABILITIES)[number];

const ABILITY_ABBR: Record<string, Ability> = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
};

const ABILITY_WORDS =
  "Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma";

/** `12 (2d6 + 5)` — printed average wrapping a dice expression. */
const DAMAGE_RE = /\d+ \(\d+d\d+(?: [+-] \d+)?\)/g;

/**
 * Tag every `avg (dice)` clause in a text span as `{@damage dice}`, dropping
 * the literal average. The resolver recomputes and re-prepends the average,
 * so the rewrite is only kept when that recomputation matches the printed
 * number (it does for the entire 2024 SRD dataset).
 */
function tagDamage(text: string, ctx: MarkupContext): string {
  return text.replace(DAMAGE_RE, (match) => {
    const dice = match.slice(match.indexOf("(") + 1, -1);
    const tag = `{@damage ${dice}}`;
    return resolveMarkup(tag, ctx) === match ? tag : match;
  });
}

/**
 * The ability whose `mod + PB` produces `bonus`, if one can be picked safely:
 * a unique match wins outright; ties fall to the conventional attack stat
 * (STR-first for melee and thrown, DEX-first for ranged) when it is among the
 * candidates. Spell attacks have no such convention (the casting stat could
 * be any mental ability), so only a unique match wins there. No safe pick ->
 * null, and the bonus stays flat.
 */
function inferHitAbility(
  bonus: number,
  kind: string,
  ctx: MarkupContext,
  weapon = true,
): Ability | null {
  const matches = ABILITIES.filter((a) => hitBonus(a, ctx) === bonus);
  if (matches.length === 1) return matches[0];
  if (!weapon) return null;
  const preference: ReadonlyArray<Ability> =
    kind === "r" ? ["dex", "str"] : ["str", "dex"];
  return preference.find((a) => matches.includes(a)) ?? null;
}

function inferDcAbility(
  dc: number,
  saveAbility: Ability,
  ctx: MarkupContext,
): Ability | null {
  if (dcValue(saveAbility, ctx) === dc) return saveAbility;
  const matches = ABILITIES.filter((a) => dcValue(a, ctx) === dc);
  return matches.length === 1 ? matches[0] : null;
}

interface Rewrite {
  /** Exclusive end of the consumed source span. */
  end: number;
  replacement: string;
}

const DICE_SRC = String.raw`\d+d\d+(?: [+-] \d+)?`;
/** Groups: printed average, dice, flat amount, capitalized damage type. */
const DAMAGE_SRC = String.raw`(?:(\d+) \((${DICE_SRC})\)|(\d+))(?: ([A-Z][a-z]+))? damage`;

const ATTACK_RE = new RegExp(
  String.raw`(Melee or Ranged|Melee|Ranged) Attack Roll: ([+-]\d+)` +
    String.raw`(?:, reach (\d+) ft\.(?: or range (\d+(?:/\d+)?) ft\.)?|, range (\d+(?:/\d+)?) ft\.|\.)` +
    String.raw` (${DAMAGE_SRC}(?: plus ${DAMAGE_SRC})?(?:, and ([^.]*))?)\.`,
  "y",
);

function attackKind(word: string): string {
  return word === "Melee" ? "m" : word === "Ranged" ? "r" : "m,r";
}

/** Whole-line `{@attack …}` composite; null when the grammar can't hold it. */
function convertAttack(
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  ATTACK_RE.lastIndex = start;
  const m = ATTACK_RE.exec(text);
  if (!m) return null;
  const kind = attackKind(m[1]);
  const bonus = Number.parseInt(m[2], 10);
  const reach =
    kind === "m,r"
      ? [m[3] ?? "", m[5] ?? m[4] ?? ""].join(";").replace(/;$/, "")
      : (m[3] ?? m[5] ?? "");
  const fields: AttackFields = {
    kind,
    hit: inferHitAbility(bonus, kind, ctx) ?? String(bonus),
    reach,
    dice: m[8] ?? m[9] ?? "",
    type: (m[10] ?? "").toLowerCase(),
    dice2: m[12] ?? m[13] ?? "",
    type2: (m[14] ?? "").toLowerCase(),
    effect: m[15] ? tagDamage(m[15], ctx) : "",
  };
  const replacement = `{@attack ${serializeAttackArgs(fields)}}`;
  const end = start + m[0].length;
  // The adopted `Hit: ` label lands right where the damage clause (group 6,
  // which runs to just before the final period) begins.
  const hitStart = end - 1 - m[6].length;
  const expected = `${text.slice(start, hitStart)}Hit: ${text.slice(hitStart, end)}`;
  if (resolveMarkup(replacement, ctx) !== expected) return null;
  return { end, replacement };
}

const ATTACK_HEAD_RE = /(Melee or Ranged|Melee|Ranged) Attack Roll: ([+-]\d+)/y;

/** Head-only fallback: `{@atkr m} {@hit str}`; the rest of the line stays prose. */
function convertAttackHead(
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  ATTACK_HEAD_RE.lastIndex = start;
  const m = ATTACK_HEAD_RE.exec(text);
  if (!m) return null;
  const kind = attackKind(m[1]);
  const bonus = Number.parseInt(m[2], 10);
  const hit = inferHitAbility(bonus, kind, ctx) ?? String(bonus);
  const replacement = `{@atkr ${kind}} {@hit ${hit}}`;
  if (resolveMarkup(replacement, ctx) !== m[0]) return null;
  return { end: start + m[0].length, replacement };
}

const LEGACY_ATTACK_HEAD_RE =
  /(Melee or Ranged|Melee|Ranged) (Weapon|Spell) Attack: ([+-]\d+) to hit/y;

/**
 * Head-only 2014 rewrite: `Melee Weapon Attack: +4 to hit` becomes
 * `{@atk mw} {@hit str} to hit`. The rest of the line stays prose (there is
 * no composite grammar for the 2014 wording) and `tagDamage` picks up its
 * damage clauses.
 */
function convertLegacyAttackHead(
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  LEGACY_ATTACK_HEAD_RE.lastIndex = start;
  const m = LEGACY_ATTACK_HEAD_RE.exec(text);
  if (!m) return null;
  const kind = attackKind(m[1]);
  const isWeapon = m[2] === "Weapon";
  const atkArgs = kind
    .split(",")
    .map((k) => k + (isWeapon ? "w" : "s"))
    .join(",");
  const bonus = Number.parseInt(m[3], 10);
  const hit = inferHitAbility(bonus, kind, ctx, isWeapon) ?? String(bonus);
  const replacement = `{@atk ${atkArgs}} {@hit ${hit}} to hit`;
  if (resolveMarkup(replacement, ctx) !== m[0]) return null;
  return { end: start + m[0].length, replacement };
}

const LEGACY_DC_RE = new RegExp(
  String.raw`DC (\d+) (${ABILITY_WORDS})(?= saving throw)`,
  "y",
);

/**
 * 2014-style `DC 14 Wisdom saving throw`: only the DC becomes a tag, and only
 * when it can be stat-linked — the same policy as `convertSaveHead`.
 */
function convertLegacyDc(
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  LEGACY_DC_RE.lastIndex = start;
  const m = LEGACY_DC_RE.exec(text);
  if (!m) return null;
  const linked = inferDcAbility(
    Number.parseInt(m[1], 10),
    ABILITY_ABBR[m[2]],
    ctx,
  );
  if (!linked) return null;
  const replacement = `{@dc ${linked}} ${m[2]}`;
  if (resolveMarkup(replacement, ctx) !== m[0]) return null;
  return { end: start + m[0].length, replacement };
}

const SAVE_HEAD_RE = new RegExp(
  String.raw`(${ABILITY_WORDS}) Saving Throw: DC (\d+)(?:, ([^.]*))?\.`,
  "y",
);
/** Groups: the DAMAGE_SRC four, `, and` rider, or plain failure text. */
const FAIL_RE = new RegExp(
  String.raw` Failure: (?:${DAMAGE_SRC}(?:, and ([^.]*))?|([^.]*))\.`,
  "y",
);
const SUCCESS_RE = / Success: ([^.]*)\./y;
const EPILOGUE_RE = / Failure or Success: ([^.]*)\./y;

/** Whole-line `{@save …}` composite spanning the labelled sentences. */
function convertSave(
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  SAVE_HEAD_RE.lastIndex = start;
  const head = SAVE_HEAD_RE.exec(text);
  if (!head) return null;
  const ability = ABILITY_ABBR[head[1]];
  const dc = Number.parseInt(head[2], 10);
  let end = SAVE_HEAD_RE.lastIndex;

  let dice = "";
  let type = "";
  let fail = "";
  FAIL_RE.lastIndex = end;
  const failure = FAIL_RE.exec(text);
  if (failure) {
    end = FAIL_RE.lastIndex;
    if (failure[6] !== undefined) {
      fail = failure[6];
    } else {
      dice = failure[2] ?? failure[3] ?? "";
      type = (failure[4] ?? "").toLowerCase();
      fail = failure[5] ?? "";
    }
  }

  let onSave = "";
  SUCCESS_RE.lastIndex = end;
  const success = SUCCESS_RE.exec(text);
  if (success) {
    end = SUCCESS_RE.lastIndex;
    onSave = success[1] === "Half damage" ? "half" : tagDamage(success[1], ctx);
  } else if (dice) {
    // resolveSave defaults damage-bearing saves to `Success: Half damage.`; a
    // prose line with no Success sentence must suppress that explicitly.
    onSave = "none";
  }

  let epilogue = "";
  EPILOGUE_RE.lastIndex = end;
  const epi = EPILOGUE_RE.exec(text);
  if (epi) {
    end = EPILOGUE_RE.lastIndex;
    epilogue = epi[1];
  }

  const fields: SaveFields = {
    ability,
    dc: inferDcAbility(dc, ability, ctx) ?? String(dc),
    dice,
    type,
    onSave,
    target: tagDamage(head[3] ?? "", ctx),
    fail: tagDamage(fail, ctx),
    epilogue: tagDamage(epilogue, ctx),
  };
  const replacement = `{@save ${serializeSaveArgs(fields)}}`;
  if (resolveMarkup(replacement, ctx) !== text.slice(start, end)) return null;
  return { end, replacement };
}

const SAVE_HEAD_ATOMIC_RE = new RegExp(
  String.raw`(${ABILITY_WORDS}) Saving Throw: DC (\d+)`,
  "y",
);

/**
 * Head-only fallback: only the DC becomes a tag, and only when it can be
 * stat-linked — a flat `{@dc N}` would render identically to the prose it
 * replaces without adding anything.
 */
function convertSaveHead(
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  SAVE_HEAD_ATOMIC_RE.lastIndex = start;
  const m = SAVE_HEAD_ATOMIC_RE.exec(text);
  if (!m) return null;
  const linked = inferDcAbility(
    Number.parseInt(m[2], 10),
    ABILITY_ABBR[m[1]],
    ctx,
  );
  if (!linked) return null;
  const replacement = `${m[1]} Saving Throw: {@dc ${linked}}`;
  if (resolveMarkup(replacement, ctx) !== m[0]) return null;
  return { end: start + m[0].length, replacement };
}

const PATTERN_HEAD_RE = new RegExp(
  String.raw`(?:Melee or Ranged|Melee|Ranged) Attack Roll: [+-]\d+` +
    String.raw`|(?:Melee or Ranged|Melee|Ranged) (?:Weapon|Spell) Attack: [+-]\d+ to hit` +
    String.raw`|(?:${ABILITY_WORDS}) Saving Throw: DC \d+` +
    String.raw`|DC \d+ (?:${ABILITY_WORDS})(?= saving throw)`,
  "g",
);

/** Route a pattern-head match to the converter for its wording. */
function convertAt(
  head: string,
  text: string,
  start: number,
  ctx: MarkupContext,
): Rewrite | null {
  if (head.includes("Attack Roll"))
    return (
      convertAttack(text, start, ctx) ?? convertAttackHead(text, start, ctx)
    );
  if (head.includes("Attack")) return convertLegacyAttackHead(text, start, ctx);
  if (head.startsWith("DC")) return convertLegacyDc(text, start, ctx);
  return convertSave(text, start, ctx) ?? convertSaveHead(text, start, ctx);
}

/**
 * Rewrite recognizable attack-roll / saving-throw / damage prose in a feature
 * description into `{@…}` tags. Text that already contains tags (5eTools
 * imports, previously normalized data) is returned untouched, which also
 * makes the rewrite idempotent.
 */
export function proseToTags(text: string, ctx: MarkupContext): string {
  if (!text || text.includes("{@")) return text;
  let out = "";
  let cursor = 0;
  PATTERN_HEAD_RE.lastIndex = 0;
  for (let m = PATTERN_HEAD_RE.exec(text); m; m = PATTERN_HEAD_RE.exec(text)) {
    if (m.index < cursor) continue;
    const rewrite = convertAt(m[0], text, m.index, ctx);
    if (!rewrite) continue;
    out += tagDamage(text.slice(cursor, m.index), ctx);
    out += rewrite.replacement;
    cursor = rewrite.end;
  }
  return out + tagDamage(text.slice(cursor), ctx);
}

const FEATURE_LISTS = [
  "traits",
  "actions",
  "reactions",
  "bonus_actions",
  "lair_actions",
  "legendary_actions",
  "mythic_actions",
] as const;

/**
 * Run every feature description of a freshly converted monster through
 * `proseToTags`, with the monster's own stats as the resolution context.
 * Import converters whose source formats carry plain prose (Improved
 * Initiative, TetraCube, Open5e) wrap their result in this.
 */
export function tagMonsterFeatures(monster: Monster): Monster {
  const tagged = { ...monster };
  for (const key of FEATURE_LISTS) {
    tagged[key] = monster[key].map((feature) => ({
      ...feature,
      description: proseToTags(feature.description, monster),
    }));
  }
  return tagged;
}
