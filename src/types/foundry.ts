/**
 * The subset of FoundryVTT's `dnd5e` NPC actor shape that Monsterbrew exports.
 *
 * The shape is taken from real actor exports (dnd5e system 4.3.7, core 12.331,
 * `source.rules: "2024"`) attached to
 * https://github.com/ebshimizu/5e-monster-maker/issues/157 — ghoul, troll,
 * commoner and ancient white dragon. Foundry merges an imported actor against
 * its system template, so emitting a partial `system` is legal and every field
 * below is one we actually fill; fields the samples carry but Monsterbrew has no
 * source for are deliberately absent rather than guessed.
 */

/** Foundry size ids. Note `sm`/`med`/`lg` are abbreviated but `tiny`/`huge` are not. */
export type FoundrySize = "tiny" | "sm" | "med" | "lg" | "huge" | "grg";

/** `details.type.value`. Anything Monsterbrew can't match maps to `custom`. */
export type FoundryCreatureType =
  | "aberration"
  | "beast"
  | "celestial"
  | "construct"
  | "dragon"
  | "elemental"
  | "fey"
  | "fiend"
  | "giant"
  | "humanoid"
  | "monstrosity"
  | "ooze"
  | "plant"
  | "undead"
  | "custom";

export type FoundryDamageType =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder";

/**
 * Physical-damage bypass flags on `traits.di`/`traits.dr`: resistance that a
 * magical (`mgc`), silvered (`sil`) or adamantine (`ada`) weapon ignores.
 */
export type FoundryBypass = "mgc" | "sil" | "ada";

export type FoundryAbility = "str" | "dex" | "con" | "int" | "wis" | "cha";

/**
 * `activation.type`. `legendary`, `mythic` and `lair` are the monster-category
 * ids; `special` is the passive catch-all. Verified against dnd5e's
 * `CONFIG.DND5E.activityActivationTypes`.
 */
export type FoundryActivationType =
  | "action"
  | "bonus"
  | "reaction"
  | "legendary"
  | "mythic"
  | "lair"
  | "special";

/** A trait list: known ids in `value`, everything else free-text in `custom`. */
export interface FoundryTraitList<T extends string = string> {
  value: Array<T>;
  custom: string;
  bypasses?: Array<FoundryBypass>;
}

export interface FoundryDamagePart {
  /** Dice count. `null` for a bonus-only part (flat damage). */
  number: number | null;
  /** Die size: the `8` of `2d8`. `null` for a bonus-only part. */
  denomination: number | null;
  /** Flat term appended to the dice, as a formula string. */
  bonus: string;
  types: Array<FoundryDamageType>;
  custom: { enabled: false };
  scaling: { number: 1 };
}

interface FoundryActivityBase {
  _id: string;
  sort: number;
  activation: {
    type: FoundryActivationType;
    value: number | null;
    override: false;
  };
}

export interface FoundryAttackActivity extends FoundryActivityBase {
  type: "attack";
  attack: {
    /** Empty when `flat` is true and the bonus carries the whole to-hit. */
    ability: FoundryAbility | "";
    /** `true` pins the roll to `bonus` alone, ignoring ability + proficiency. */
    flat: boolean;
    bonus: string;
    type: { value: "melee" | "ranged"; classification: "weapon" };
    critical: { threshold: null };
  };
  damage: { includeBase: boolean; parts: Array<FoundryDamagePart> };
  range: {
    units: "ft";
    value: string | null;
    long: string | null;
    reach: string | null;
    override: boolean;
  };
}

export interface FoundrySaveActivity extends FoundryActivityBase {
  type: "save";
  save: {
    ability: Array<FoundryAbility>;
    /**
     * `calculation` names the ability Foundry derives the DC from (8 + PB +
     * mod) — the direct analogue of Monsterbrew's `{@dc con}`. A flat DC sets
     * `calculation: ""` and puts the number in `formula`.
     */
    dc: { calculation: FoundryAbility | ""; formula: string };
  };
  damage: { parts: Array<FoundryDamagePart>; onSave: "half" | "none" | "full" };
}

export interface FoundryUtilityActivity extends FoundryActivityBase {
  type: "utility";
}

export type FoundryActivity =
  | FoundryAttackActivity
  | FoundrySaveActivity
  | FoundryUtilityActivity;

export interface FoundryItem {
  _id: string;
  name: string;
  /** `weapon` carries attacks; everything else is a monster `feat`. */
  type: "weapon" | "feat";
  system: {
    type: { value: string; subtype?: string; baseItem?: string };
    description: { value: string; chat: "" };
    identifier: string;
    source: { custom: string; rules: "2024" };
    activities: Record<string, FoundryActivity>;
    /** Weapon-only: the base damage shown on the item itself. */
    damage?: { base: FoundryDamagePart };
    /** Weapon-only: `1` so Foundry adds the proficiency bonus to attacks. */
    proficient?: number;
    equipped?: boolean;
  };
}

export interface FoundryActorSystem {
  abilities: Record<FoundryAbility, { value: number; proficient: 0 | 1 }>;
  attributes: {
    ac: { flat: number; calc: "flat" };
    hp: { value: number; max: number; formula: string };
    init: { bonus: string };
    movement: {
      walk: number | null;
      swim: number | null;
      burrow: number | null;
      climb: number | null;
      fly: number | null;
      hover: boolean;
      units: "ft";
    };
    senses: {
      darkvision: number | null;
      blindsight: number | null;
      tremorsense: number | null;
      truesight: number | null;
      units: "ft";
      special: string;
    };
  };
  details: {
    type: {
      value: FoundryCreatureType;
      subtype: string;
      custom: string;
      swarm: "";
    };
    alignment: string;
    cr: number;
    biography: { value: string; public: "" };
  };
  traits: {
    size: FoundrySize;
    /** Damage immunities / resistances / vulnerabilities. */
    di: FoundryTraitList<FoundryDamageType>;
    dr: FoundryTraitList<FoundryDamageType>;
    dv: FoundryTraitList<FoundryDamageType>;
    /** Condition immunities. */
    ci: FoundryTraitList;
    languages: FoundryTraitList;
  };
  /** Keyed by Foundry's three-letter skill ids; `2` is expertise. */
  skills: Record<string, { value: 0 | 1 | 2 }>;
  resources: {
    legact: { value: number; max: number };
    legres: { value: number; max: number };
    lair: { value: boolean; initiative: null };
  };
  source: { custom: string; rules: "2024" };
}

export interface FoundryActor {
  name: string;
  type: "npc";
  system: FoundryActorSystem;
  items: Array<FoundryItem>;
  effects: [];
  folder: null;
  flags: Record<string, never>;
}
