import {
  ABILITY_KEYS,
  NONMAGICAL_PHRASES,
  hitPoints,
  initiativeModifier,
  savingThrowModifier,
  skillLabel,
  skillModifier,
} from "./export-helpers";
import type { Monster } from "@/schema/monster-schema";
import type { ImprovedInitiativeCreature } from "@/types/improved-initiative";
import { resolveMarkup } from "@/lib/statblock-markup";
import { titleCase } from "@/lib/utils";

type Feature = Monster["traits"][number];
type NamedContent = { Name: string; Content: string };

export function toImprovedInitiative(
  creature: Monster,
): ImprovedInitiativeCreature {
  const hp = hitPoints(creature);

  return {
    Source: "Monsterbrew",
    // The name slot; see the note above.
    Description: creature.name,
    Type: typeLine(creature),
    HP: { Value: hp.value, Notes: hp.formula ? `(${hp.formula})` : "" },
    AC: {
      Value: creature.armor_class,
      Notes: creature.armor_description ?? "",
    },
    InitiativeModifier: initiativeModifier(creature),
    InitiativeAdvantage: false,
    Speed: speeds(creature),
    Abilities: {
      Str: creature.ability_scores.str,
      Dex: creature.ability_scores.dex,
      Con: creature.ability_scores.con,
      Int: creature.ability_scores.int,
      Wis: creature.ability_scores.wis,
      Cha: creature.ability_scores.cha,
    },
    DamageVulnerabilities: damageList(creature, "vulnerable"),
    DamageResistances: damageList(creature, "resistant"),
    DamageImmunities: damageList(creature, "immune"),
    ConditionImmunities: [...creature.condition_immunities],
    Saves: ABILITY_KEYS.filter((key) => creature.saving_throws[key]).map(
      (key) => ({
        Name: titleCase(key),
        Modifier: savingThrowModifier(creature, key),
      }),
    ),
    Skills: Object.entries(creature.skills ?? {}).map(([name, level]) => ({
      Name: skillLabel(name),
      Modifier: skillModifier(creature, name, level),
    })),
    Senses: senses(creature),
    Languages: [
      ...creature.languages,
      ...(creature.custom_languages ?? []),
    ] as Array<string>,
    Challenge: creature.cr.challenge_rating,
    Traits: [
      ...features(creature.traits, creature),
      // No lair section exists, so lair actions ride along as labelled traits
      // instead of being lost.
      ...(creature.has_lair
        ? features(creature.lair_actions, creature).map((entry) => ({
            Name: `Lair Action: ${entry.Name}`,
            Content: entry.Content,
          }))
        : []),
    ],
    Actions: features(creature.actions, creature),
    BonusActions: features(creature.bonus_actions, creature),
    Reactions: features(creature.reactions, creature),
    LegendaryActions: creature.is_legendary
      ? features(creature.legendary_actions, creature)
      : [],
    MythicActions: creature.is_mythic
      ? features(creature.mythic_actions, creature)
      : [],
    Player: "",
    Version: "",
    ImageURL: "",
  };
}

/** `"Gargantuan Dragon (Chromatic), chaotic evil"`. */
function typeLine(creature: Monster): string {
  const head = [titleCase(creature.size), titleCase(creature.type)]
    .filter(Boolean)
    .join(" ");
  const withSubtype = creature.sub_type
    ? `${head} (${titleCase(creature.sub_type)})`
    : head;
  return creature.alignment
    ? `${withSubtype}, ${creature.alignment}`
    : withSubtype;
}

/** Every speed keeps its keyword, which is what the importer matches on. */
function speeds(creature: Monster): Array<string> {
  const { walk, climb, fly, swim, burrow, hover } = creature.movements;
  const entries: Array<string> = [];
  if (walk > 0) entries.push(`walk ${walk} ft.`);
  if (climb > 0) entries.push(`climb ${climb} ft.`);
  if (fly > 0) entries.push(`fly ${fly} ft.${hover ? " (hover)" : ""}`);
  if (swim > 0) entries.push(`swim ${swim} ft.`);
  if (burrow > 0) entries.push(`burrow ${burrow} ft.`);
  return entries;
}

function senses(creature: Monster): Array<string> {
  const entries: Array<string> = [];
  const { blindsight, darkvision, tremorsense, truesight, is_blind_beyond } =
    creature.senses;
  if (blindsight > 0) {
    entries.push(
      `blindsight ${blindsight} ft.${
        is_blind_beyond ? " (blind beyond this radius)" : ""
      }`,
    );
  }
  if (darkvision > 0) entries.push(`darkvision ${darkvision} ft.`);
  if (tremorsense > 0) entries.push(`tremorsense ${tremorsense} ft.`);
  if (truesight > 0) entries.push(`truesight ${truesight} ft.`);
  // The importer parses this line back out, so it always has to be present.
  entries.push(`passive Perception ${creature.passive_perception || 10}`);
  return entries;
}

/**
 * Improved Initiative's damage lists are free text, so the nonmagical-attack
 * modifiers — which have no field of their own — are spelled out here rather
 * than dropped. They come back as free-text damage keys on import, not as
 * `nonmagical_attack_modifiers`; that is the format's limit, not a bug.
 */
function damageList(
  creature: Monster,
  state: "resistant" | "vulnerable" | "immune",
): Array<string> {
  const types = Object.entries(creature.damage_modifiers ?? {})
    .filter(([, value]) => value === state)
    .map(([type]) => type);

  const nonmagical = Object.entries(creature.nonmagical_attack_modifiers ?? {})
    .filter(([, value]) => value === state)
    .map(([type]) => NONMAGICAL_PHRASES[type] ?? NONMAGICAL_PHRASES.nonmagical);

  return [...types, ...nonmagical];
}

function features(entries: Array<Feature>, ctx: Monster): Array<NamedContent> {
  return entries.map((entry) => ({
    Name: entry.name,
    Content: resolveMarkup(entry.description, ctx),
  }));
}
