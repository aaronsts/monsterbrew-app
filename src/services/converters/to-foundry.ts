import {
  NONMAGICAL_PHRASES,
  hitPoints,
  initiativeModifier,
} from "./export-helpers";
import type {
  FoundryAbility,
  FoundryActivationType,
  FoundryActivity,
  FoundryActor,
  FoundryBypass,
  FoundryCreatureType,
  FoundryDamagePart,
  FoundryDamageType,
  FoundryItem,
  FoundrySize,
  FoundryTraitList,
} from "@/types/foundry";
import type {
  AttackFields,
  MarkupContext,
  Segment,
} from "@/lib/statblock-markup";
import type { Monster } from "@/schema/monster-schema";
import { DAMAGE_TYPES } from "@/types/types";
import { SKILLS } from "@/lib/skills";
import {
  dcValue,
  hitBonus,
  parseAttackArgs,
  parseMarkup,
  parseSaveArgs,
  resolveDiceExpression,
  resolveMarkup,
} from "@/lib/statblock-markup";
import { calculateStatBonus } from "@/lib/utils";

/**
 *`{@attack …}` and `{@save …}` markup carries exactly the
 * structure Foundry's activity model wants, so tagged features become *rollable*
 * attack/save activities rather than plain text. Two mappings are direct:
 * `{@hit str}` -> `attack.ability: "str"` and `{@dc con}` ->
 * `save.dc.calculation: "con"`, both meaning "derive it from the creature".
 * Anything that doesn't parse falls back to a descriptive item, and the fully
 * resolved text is always kept in the description either way, so no content is
 * lost.
 */
export function monsterToFoundryActor(creature: Monster): FoundryActor {
  return {
    name: creature.name,
    type: "npc",
    system: {
      abilities: toAbilities(creature),
      attributes: {
        ac: { flat: creature.armor_class, calc: "flat" },
        hp: toHitPoints(creature),
        init: { bonus: toInitiativeBonus(creature) },
        movement: {
          walk: orNull(creature.movements.walk),
          swim: orNull(creature.movements.swim),
          burrow: orNull(creature.movements.burrow),
          climb: orNull(creature.movements.climb),
          fly: orNull(creature.movements.fly),
          hover: creature.movements.hover,
          units: "ft",
        },
        senses: {
          darkvision: orNull(creature.senses.darkvision),
          blindsight: orNull(creature.senses.blindsight),
          tremorsense: orNull(creature.senses.tremorsense),
          truesight: orNull(creature.senses.truesight),
          units: "ft",
          special: creature.senses.is_blind_beyond
            ? "blind beyond this radius"
            : "",
        },
      },
      details: {
        type: toCreatureType(creature),
        alignment: creature.alignment ?? "",
        cr: toChallengeRating(creature.cr.challenge_rating),
        biography: { value: toBiography(creature.description), public: "" },
      },
      traits: toTraits(creature),
      skills: toSkills(creature),
      resources: {
        legact: creature.is_legendary
          ? {
              value: LEGENDARY_ACTIONS_PER_ROUND,
              max: LEGENDARY_ACTIONS_PER_ROUND,
            }
          : { value: 0, max: 0 },
        // Monsterbrew has no legendary-resistance field, so there is nothing to
        // map; inferring one from a trait name would be a guess.
        legres: { value: 0, max: 0 },
        lair: { value: creature.has_lair, initiative: null },
      },
      source: SOURCE,
    },
    items: toItems(creature),
    effects: [],
    folder: null,
    flags: {},
  };
}

/**
 * 5e gives almost every legendary creature three legendary actions per round and
 * Monsterbrew has no field for it, so this is the assumed default.
 */
const LEGENDARY_ACTIONS_PER_ROUND = 3;

const SOURCE = { custom: "Monsterbrew", rules: "2024" } as const;

const ABILITIES: Array<FoundryAbility> = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];
const ABILITY_SET = new Set<string>(ABILITIES);

const isAbility = (value: string): value is FoundryAbility =>
  ABILITY_SET.has(value.trim().toLowerCase());

/** Monsterbrew size ids -> Foundry's. Foundry has no `titanic`. */
const SIZE_IDS: Record<string, FoundrySize> = {
  tiny: "tiny",
  small: "sm",
  medium: "med",
  large: "lg",
  huge: "huge",
  gargantuan: "grg",
  titanic: "grg",
};

const CREATURE_TYPE_IDS = new Set<string>([
  "aberration",
  "beast",
  "celestial",
  "construct",
  "dragon",
  "elemental",
  "fey",
  "fiend",
  "giant",
  "humanoid",
  "monstrosity",
  "ooze",
  "plant",
  "undead",
]);

const DAMAGE_TYPE_SET = new Set<string>(DAMAGE_TYPES);

/** Our skill names -> Foundry's three-letter skill ids. */
const SKILL_IDS: Record<string, string> = {
  acrobatics: "acr",
  "animal handling": "ani",
  arcana: "arc",
  athletics: "ath",
  deception: "dec",
  history: "his",
  insight: "ins",
  intimidation: "itm",
  investigation: "inv",
  medicine: "med",
  nature: "nat",
  perception: "prc",
  performance: "prf",
  persuasion: "per",
  religion: "rel",
  "sleight of hand": "slt",
  stealth: "ste",
  survival: "sur",
};

/** Only two of our language ids differ from Foundry's; the rest pass through. */
const LANGUAGE_IDS: Record<string, string> = {
  "deep-speech": "deep",
  "thieves-cant": "cant",
};

/** The physical damage types a "nonmagical attacks" modifier covers. */
const PHYSICAL_DAMAGE: Array<FoundryDamageType> = [
  "bludgeoning",
  "piercing",
  "slashing",
];

const BYPASSES: Record<string, FoundryBypass> = {
  nonmagical: "mgc",
  silvered: "sil",
};

/** Foundry treats a missing speed/sense as `null`, not `0`. */
const orNull = (value: number) => (value > 0 ? value : null);

function toAbilities(creature: Monster): FoundryActor["system"]["abilities"] {
  return Object.fromEntries(
    ABILITIES.map((key) => [
      key,
      {
        value: creature.ability_scores[key],
        proficient: creature.saving_throws[key] ? 1 : 0,
      },
    ]),
  ) as FoundryActor["system"]["abilities"];
}

/**
 * `value`/`max` and the dice `formula`. Both come out of `calculateHitPoints`
 * ("32 (5d8 + 10)") so the median-HP maths stays in one place; a custom HP
 * string is parsed the same way, since users write it in the same shape.
 */
function toHitPoints(creature: Monster) {
  const { value, formula } = hitPoints(creature);
  return { value, max: value, formula };
}

/**
 * Foundry rolls initiative as DEX mod + `bonus`, so an authored initiative has
 * to be expressed as the difference rather than the total.
 */
function toInitiativeBonus(creature: Monster): string {
  if (!creature.custom_initiative) return "";
  const delta =
    initiativeModifier(creature) -
    calculateStatBonus(creature.ability_scores.dex);
  return delta === 0 ? "" : `${delta}`;
}

function toCreatureType(creature: Monster) {
  const value = creature.type.trim().toLowerCase();
  const known = CREATURE_TYPE_IDS.has(value);
  return {
    value: (known ? value : "custom") as FoundryCreatureType,
    subtype: creature.sub_type,
    custom: known ? "" : creature.type,
    swarm: "" as const,
  };
}

function toChallengeRating(cr: string): number {
  const fractions: Record<string, number> = {
    "1/8": 0.125,
    "1/4": 0.25,
    "1/2": 0.5,
  };
  const fraction = fractions[cr.trim()];
  if (fraction !== undefined) return fraction;
  // `Number("")` is 0 and `Number("unknown")` is NaN; Foundry needs a number.
  const parsed = Number(cr);
  return Number.isFinite(parsed) ? parsed : 0;
}

const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/**
 * Resolved markup into the HTML Foundry expects. `resolveMarkup` renders `{@i}`
 * and `{@b}` as markdown (`*text*`, `**text**`) because Homebrewery wants that;
 * dropped into an HTML field it would show literal asterisks instead.
 */
const inlineHtml = (text: string) =>
  escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

/** Blank-line separated paragraphs into `<p>` tags, escaped. */
function toBiography(description: string | undefined): string {
  if (!description?.trim()) return "";
  return description
    .trim()
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para.trim())}</p>`)
    .join("");
}

function toTraits(creature: Monster): FoundryActor["system"]["traits"] {
  const groups: Record<
    "immune" | "resistant" | "vulnerable",
    FoundryTraitList<FoundryDamageType>
  > = {
    immune: emptyList(),
    resistant: emptyList(),
    vulnerable: emptyList(),
  };

  for (const [type, state] of Object.entries(creature.damage_modifiers ?? {})) {
    const key = type.trim().toLowerCase();
    const list = groups[state];
    if (DAMAGE_TYPE_SET.has(key)) list.value.push(key as FoundryDamageType);
    else list.custom = list.custom ? `${list.custom}; ${type}` : type;
  }

  // "Resistant to nonmagical attacks" is, in Foundry's model, resistance to the
  // three physical types with a `mgc` bypass — i.e. magic ignores it.
  //
  // But `bypasses` is a property of the whole list, not of an entry: setting it
  // alongside an unrelated entry would make that one bypassable too (a magical
  // Fireball hitting a flatly fire-immune creature). So the mechanical form is
  // only safe when the list holds nothing else; otherwise the clause goes to
  // `custom`, which Foundry shows on the sheet but doesn't apply automatically.
  for (const [type, state] of Object.entries(
    creature.nonmagical_attack_modifiers ?? {},
  )) {
    const key = type.trim().toLowerCase();
    const bypass = BYPASSES[key];
    if (!bypass) continue;
    const list = groups[state];

    if (list.value.length === 0 && !list.bypasses) {
      list.value.push(...PHYSICAL_DAMAGE);
      list.bypasses = [bypass];
    } else {
      const phrase = NONMAGICAL_PHRASES[key] ?? NONMAGICAL_PHRASES.nonmagical;
      list.custom = list.custom ? `${list.custom}; ${phrase}` : phrase;
    }
  }

  const languages = creature.languages.map(
    (id) => LANGUAGE_IDS[id] ?? (id as string),
  );

  return {
    size: SIZE_IDS[creature.size.trim().toLowerCase()] ?? "med",
    di: groups.immune,
    dr: groups.resistant,
    dv: groups.vulnerable,
    ci: { value: [...creature.condition_immunities], custom: "" },
    languages: {
      value: languages,
      custom: (creature.custom_languages ?? []).join("; "),
    },
  };
}

function emptyList(): FoundryTraitList<FoundryDamageType> {
  return { value: [], custom: "" };
}

/**
 * Foundry expects every skill key present, with `0` for untrained — the sheet
 * reads the whole record rather than treating absence as zero.
 */
function toSkills(creature: Monster): FoundryActor["system"]["skills"] {
  const skills: FoundryActor["system"]["skills"] = {};
  for (const { skill_name } of SKILLS) {
    const id = SKILL_IDS[skill_name];
    if (id) skills[id] = { value: 0 };
  }
  for (const [name, level] of Object.entries(creature.skills ?? {})) {
    const id = SKILL_IDS[name.trim().toLowerCase()];
    if (id) skills[id] = { value: level === "expert" ? 2 : 1 };
  }
  return skills;
}

interface Section {
  features: Monster["traits"];
  activation: FoundryActivationType | null;
  enabled?: boolean;
  key: string;
}

function toItems(creature: Monster): Array<FoundryItem> {
  const sections: Array<Section> = [
    { key: "trait", features: creature.traits, activation: null },
    { key: "action", features: creature.actions, activation: "action" },
    { key: "bonus", features: creature.bonus_actions, activation: "bonus" },
    { key: "reaction", features: creature.reactions, activation: "reaction" },
    {
      key: "legendary",
      features: creature.legendary_actions,
      activation: "legendary",
      enabled: creature.is_legendary,
    },
    {
      key: "mythic",
      features: creature.mythic_actions,
      activation: "mythic",
      enabled: creature.is_mythic,
    },
    {
      key: "lair",
      features: creature.lair_actions,
      activation: "lair",
      enabled: creature.has_lair,
    },
  ];

  const items: Array<FoundryItem> = [];
  for (const section of sections) {
    if (section.enabled === false) continue;
    section.features.forEach((feature, index) => {
      items.push(toItem(feature, section, index, creature));
    });
  }
  return items;
}

function toItem(
  feature: Monster["traits"][number],
  section: Section,
  index: number,
  creature: Monster,
): FoundryItem {
  const id = foundryId(`${creature.name}:${section.key}:${index}`);
  const activityId = foundryId(
    `${creature.name}:${section.key}:${index}:activity`,
  );
  const description = resolveMarkup(feature.description, creature);

  const attack = readAttack(feature.description);
  const save = findTag(feature.description, "save");

  const base = {
    _id: id,
    name: feature.name,
    system: {
      description: {
        value: `<p>${inlineHtml(description)}</p>`,
        chat: "" as const,
      },
      identifier: slug(feature.name),
      source: SOURCE,
    },
  };

  if (attack && section.activation) {
    const split = splitAttackDamage(attack, creature);
    const activity = toAttackActivity(
      attack,
      activityId,
      section.activation,
      creature,
      { includeBase: split.base !== null, parts: split.parts },
    );
    // A feature can be both — "…Hit: 2d8 piercing, and the target makes a CON
    // save". Foundry items hold many activities, so the save gets its own
    // rather than being lost to the attack branch.
    const saveId = foundryId(
      `${creature.name}:${section.key}:${index}:activity:save`,
    );
    return {
      ...base,
      type: "weapon",
      system: {
        ...base.system,
        type: { value: "natural", baseItem: "" },
        activities: {
          [activityId]: activity,
          ...(save
            ? {
                [saveId]: toSaveActivity(
                  save,
                  saveId,
                  section.activation,
                  creature,
                ),
              }
            : {}),
        },
        ...(split.base ? { damage: { base: split.base } } : {}),
        // Natural weapons are always proficient, which is what makes an
        // ability-linked `{@hit str}` come out as mod + PB in Foundry.
        proficient: 1,
        equipped: true,
      },
    };
  }

  const activities: Record<string, FoundryActivity> = {};
  if (section.activation) {
    activities[activityId] =
      save != null
        ? toSaveActivity(save, activityId, section.activation, creature)
        : {
            type: "utility",
            _id: activityId,
            sort: 0,
            activation: {
              type: section.activation,
              value: null,
              override: false,
            },
          };
  }

  return {
    ...base,
    type: "feat",
    system: {
      ...base.system,
      type: { value: "monster", subtype: "" },
      activities,
    },
  };
}

/** The args of the first `{@name …}` tag in `text`, or null. */
function findTag(text: string, name: string): string | null {
  for (const segment of parseMarkup(text)) {
    if (segment.type === "tag" && segment.name === name && segment.args) {
      return segment.args;
    }
  }
  return null;
}

/**
 * A feature's attack, from either markup form. `prose-to-tags` falls back to the
 * atomic `{@atkr m} {@hit str}` / 2014 `{@atk mw}` sequence whenever a line
 * won't fit the composite grammar, and ~30 SRD actions are written that way —
 * reading only `{@attack …}` would silently export those as non-rollable feats.
 * `damage-per-round.ts` treats both forms as attacks for the same reason.
 */
function readAttack(description: string): AttackFields | null {
  const composite = findTag(description, "attack");
  if (composite) return parseAttackArgs(composite);

  let kind = "";
  let hit = "";
  const damages: Array<{ dice: string; type: string }> = [];

  const segments = parseMarkup(description);
  segments.forEach((segment, index) => {
    if (segment.type !== "tag") return;
    if (segment.name === "atkr" && !kind) kind = segment.args;
    // 2014 form: {@atk mw} / {@atk rs} — the r/m is all we need here.
    else if (segment.name === "atk" && !kind) {
      kind = /r/.test(segment.args) ? "r" : "m";
    } else if (segment.name === "hit" && !hit) hit = segment.args;
    else if (segment.name === "damage") {
      const [dice, tagged = ""] = segment.args.split("|");
      damages.push({
        dice,
        // The atomic form usually leaves the type in the prose that follows
        // ("… Slashing damage"), since only the composite tag has a type slot.
        type: tagged || typeAfter(segments[index + 1]),
      });
    }
  });

  if (!hit) return null;
  return {
    kind: kind || "m",
    hit,
    reach: readReach(description, kind),
    dice: damages[0]?.dice ?? "",
    type: damages[0]?.type ?? "",
    dice2: damages[1]?.dice ?? "",
    type2: damages[1]?.type ?? "",
    effect: "",
  };
}

/** `" Slashing damage plus …"` -> `"slashing"`. */
function typeAfter(segment: Segment | undefined): string {
  if (!segment || segment.type !== "text") return "";
  return /^\s*(\w+)\s+damage\b/i.exec(segment.value)?.[1].toLowerCase() ?? "";
}

/**
 * Reach/range out of the prose, in the same encoding `parseAttackArgs` uses:
 * `"5"` for melee, `"30/120"` for ranged, `"5;30/120"` for both.
 */
function readReach(description: string, kind: string): string {
  const reach = /reach\s+(\d+)\s*(?:ft|feet)/i.exec(description)?.[1] ?? "";
  const range = /range\s+(\d+)(?:\s*\/\s*(\d+))?\s*(?:ft|feet)/i.exec(
    description,
  );
  const ranged = range ? [range[1], range[2]].filter(Boolean).join("/") : "";
  if (/m/.test(kind) && /r/.test(kind)) return `${reach};${ranged}`;
  return ranged || reach;
}

/**
 * Where an attack's damage goes. Foundry auto-appends `@mod` to a **weapon's
 * base damage** (see dnd5e's `AttackActivityData._processDamagePart`), but not
 * to an activity's `parts`. So the primary damage may only sit on the item when
 * its ability keyword matches the to-hit ability — and then with that term
 * *removed*, exactly as Foundry's own exports do (their `damage.base.bonus` is
 * empty). Writing the resolved modifier there instead would roll it twice.
 *
 * The payoff beyond correctness: editing the creature's STR in Foundry then
 * moves to-hit *and* damage together, matching what `{@damage 2d8 + str}` means.
 *
 * Anything else — a flat bonus, a different ability, a flat to-hit — goes in
 * `parts` with its numbers resolved, where nothing is added behind our back.
 */
function splitAttackDamage(
  f: AttackFields,
  ctx: MarkupContext,
): { base: FoundryDamagePart | null; parts: Array<FoundryDamagePart> } {
  const rider = damagePart(f.dice2, f.type2, ctx);
  const riders = rider ? [rider] : [];

  if (isAbility(f.hit)) {
    const ability = f.hit.trim().toLowerCase();
    const hasAbility = new RegExp(`\\b${ability}\\b`, "i").test(f.dice);
    if (hasAbility) {
      // Zero the term rather than resolving it; `resolveDiceExpression` then
      // tidies the `+ 0` away and Foundry supplies the modifier.
      const withoutMod = f.dice.replace(
        new RegExp(`\\b${ability}\\b`, "gi"),
        "0",
      );
      const base = damagePart(withoutMod, f.type, ctx);
      // Only when dice survive: Foundry skips `@mod` on a deterministic base,
      // so a mod-only expression has to take the explicit route instead.
      if (base?.denomination) return { base, parts: riders };
    }
  }

  const primary = damagePart(f.dice, f.type, ctx);
  return { base: null, parts: [...(primary ? [primary] : []), ...riders] };
}

function toAttackActivity(
  f: AttackFields,
  id: string,
  activation: FoundryActivationType,
  ctx: MarkupContext,
  damage: { includeBase: boolean; parts: Array<FoundryDamagePart> },
): FoundryActivity {
  const melee = /m/.test(f.kind);
  const ranged = /r/.test(f.kind);
  const abilityHit = isAbility(f.hit);

  // `m,r` packs both distances as "reach;normal/long".
  let reach: string | null = null;
  let value: string | null = null;
  let long: string | null = null;
  if (melee && ranged) {
    const [near = "", far = ""] = f.reach.split(";").map((p) => p.trim());
    reach = near || null;
    [value, long] = splitRange(far);
  } else if (ranged) {
    [value, long] = splitRange(f.reach);
  } else {
    reach = f.reach.trim() || null;
  }

  return {
    type: "attack",
    _id: id,
    sort: 0,
    activation: { type: activation, value: null, override: false },
    attack: {
      ability: abilityHit ? (f.hit.toLowerCase() as FoundryAbility) : "",
      flat: !abilityHit,
      bonus: abilityHit ? "" : `${hitBonus(f.hit, ctx)}`,
      type: {
        value: melee || !ranged ? "melee" : "ranged",
        classification: "weapon",
      },
      critical: { threshold: null },
    },
    damage,
    range: { units: "ft", value, long, reach, override: false },
  };
}

function toSaveActivity(
  args: string,
  id: string,
  activation: FoundryActivationType,
  ctx: MarkupContext,
): FoundryActivity {
  const f = parseSaveArgs(args);
  const abilityDc = isAbility(f.dc);
  const part = damagePart(f.dice, f.type, ctx);

  // Mirrors the renderer: no explicit success text plus damage means half.
  const onSave = f.onSave || (part ? "half" : "");

  return {
    type: "save",
    _id: id,
    sort: 0,
    activation: { type: activation, value: null, override: false },
    save: {
      ability: isAbility(f.ability)
        ? [f.ability.toLowerCase() as FoundryAbility]
        : [],
      dc: abilityDc
        ? { calculation: f.dc.toLowerCase() as FoundryAbility, formula: "" }
        : { calculation: "", formula: `${dcValue(f.dc, ctx)}` },
    },
    // Foundry only models half/none/full. Custom success wording can't be
    // expressed, so it degrades to "none" and survives in the description.
    damage: {
      parts: part ? [part] : [],
      onSave: onSave === "half" ? "half" : "none",
    },
  };
}

/** `"30/120"` -> `["30", "120"]`; `"60"` -> `["60", null]`; `""` -> `[null, null]`. */
function splitRange(reach: string): [string | null, string | null] {
  const [near = "", far = ""] = reach.split("/").map((p) => p.trim());
  return [near || null, far || null];
}

/**
 * A dice expression into Foundry's structured damage part. Ability keywords are
 * resolved to literal numbers first, so the exported actor rolls exactly what
 * the statblock shows.
 */
function damagePart(
  dice: string,
  type: string,
  ctx: MarkupContext,
): FoundryDamagePart | null {
  const expr = resolveDiceExpression(dice, ctx).replace(/\s+/g, "");
  if (!expr) return null;

  const damageType = type.trim().toLowerCase();
  const types = DAMAGE_TYPE_SET.has(damageType)
    ? [damageType as FoundryDamageType]
    : [];

  // Term-by-term rather than an anchored match: the dice aren't always first
  // ("str + 2d6" resolves to "5 + 2d6"), and anchoring dropped them silently.
  const terms = expr.match(/[+-]?\d*d\d+|[+-]?\d+/g) ?? [];
  let number: number | null = null;
  let denomination: number | null = null;
  const bonuses: Array<string> = [];

  for (const term of terms) {
    const die = /^([+-]?)(\d*)d(\d+)$/.exec(term);
    if (die && number === null) {
      const count = die[2] === "" ? 1 : Number.parseInt(die[2], 10);
      number = die[1] === "-" ? -count : count;
      denomination = Number.parseInt(die[3], 10);
    } else {
      bonuses.push(term);
    }
  }

  return {
    number,
    denomination,
    bonus: bonuses.join("").replace(/^\+/, ""),
    types,
    custom: { enabled: false },
    scaling: { number: 1 },
  };
}

const slug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");

const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** FNV-1a, seeded so one input can yield several independent 32-bit words. */
function hash32(input: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Foundry ids are 16 alphanumeric characters. Deriving them from the creature
 * and feature rather than randomly keeps re-exports byte-identical, which makes
 * the fixture test stable and means re-importing doesn't fork the actor.
 */
function foundryId(seed: string): string {
  let out = "";
  for (let word = 0; word < 4; word++) {
    let h = hash32(seed, 0x811c9dc5 + word * 0x9e3779b9);
    for (let i = 0; i < 4; i++) {
      out += ID_ALPHABET[h % ID_ALPHABET.length];
      h = Math.floor(h / ID_ALPHABET.length);
    }
  }
  return out;
}
