import type { Monster } from "@/schema/monster-schema";
import { abilityScoresSchema } from "@/schema/monster-schema";
import { SKILLS } from "@/lib/skills";
import { resolveMarkup } from "@/lib/statblock-markup";
import { calculateHitPoints, calculateStatBonus, titleCase } from "@/lib/utils";

const ABILITY_KEYS = abilityScoresSchema.keyof().options;
const SKILL_ABILITY = new Map<string, string>(
  SKILLS.map((s) => [s.skill_name, s.skill_modifier]),
);

function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Capitalize each word. The statblock renders these lists with CSS
 * `capitalize`; markdown has no such affordance, so we do it here.
 */
function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

type Feature = Monster["traits"][number];

/**
 * Render a list of traits/actions as Homebrewery feature lines. Each entry
 * except the last is followed by a `:` line so Homebrewery keeps the spacing
 * between features. 5eTools `{@…}` markup is resolved against the creature so
 * exported text carries no stray tokens.
 */
function featureLines(features: Array<Feature>, ctx: Monster): Array<string> {
  const lines: Array<string> = [];
  features.forEach((feature, i) => {
    lines.push(
      `***${titleCase(feature.name)}.*** ${resolveMarkup(feature.description, ctx)}`,
    );
    if (i < features.length - 1) lines.push(":");
  });
  return lines;
}

/**
 * Convert a canonical `Monster` into Homebrewery V3 markdown. Pure and
 * side-effect free so it can be unit-tested; `createMarkdownPage` wraps it for
 * the browser export.
 */
export function monsterToHomebrewery(creature: Monster): string {
  const pb = creature.cr.proficiency_bonus || 0;
  const lines: Array<string> = [];

  const movements: Array<string> = [];
  Object.entries(creature.movements).forEach(([key, value]) => {
    if (!value) return;
    movements.push(
      key === "walk" ? `${value} ft.` : `${titleCase(key)} ${value} ft.`,
    );
  });

  const medianHP = calculateHitPoints(
    creature.hit_dice,
    creature.size,
    creature.ability_scores.con,
  );
  const hp = creature.custom_hp
    ? creature.hit_points
    : medianHP || creature.hit_points;

  lines.push("{{monster,frame,wide");
  lines.push(
    `## ${creature.name}`,
    `*${titleCase(creature.size)} ${creature.type}${
      creature.alignment ? `, ${creature.alignment}` : ""
    }*`,
    "___",
    `**Armor Class** :: ${creature.armor_class}${
      creature.armor_description ? ` (${creature.armor_description})` : ""
    }`,
    `**Hit Points** :: ${hp}`,
    `**Speed** :: ${movements.join(", ") || "30 ft."}`,
    "___",
  );

  lines.push(
    "|STR|DEX|CON|INT|WIS|CHA|",
    "|:---:|:---:|:---:|:---:|:---:|:---:|",
    `|${ABILITY_KEYS.map((key) => {
      const value = creature.ability_scores[key];
      return `${value} ${formatMod(calculateStatBonus(value))}`;
    }).join("|")}|`,
    "___",
  );

  const savingThrows = ABILITY_KEYS.filter(
    (key) => creature.saving_throws[key],
  ).map(
    (key) =>
      `${titleCase(key)} ${formatMod(
        calculateStatBonus(creature.ability_scores[key]) + pb,
      )}`,
  );
  if (savingThrows.length > 0) {
    lines.push(`**Saving Throws** :: ${savingThrows.join(", ")}`);
  }

  const skills = Object.entries(creature.skills ?? {}).map(([name, level]) => {
    const abilityKey = (SKILL_ABILITY.get(name) ??
      "dex") as (typeof ABILITY_KEYS)[number];
    const mod = calculateStatBonus(creature.ability_scores[abilityKey]);
    const bonus = mod + (level === "expert" ? pb * 2 : pb);
    return `${titleCase(name)} ${formatMod(bonus)}`;
  });
  if (skills.length > 0) {
    lines.push(`**Skills** :: ${skills.join(", ")}`);
  }

  const resistances: Array<string> = [];
  const damageImmunities: Array<string> = [];
  const vulnerabilities: Array<string> = [];
  Object.entries(creature.damage_modifiers ?? {}).forEach(([type, state]) => {
    if (state === "resistant") resistances.push(type);
    else if (state === "immune") damageImmunities.push(type);
    else if (state === "vulnerable") vulnerabilities.push(type);
  });
  const NONMAGICAL_LABELS: Record<string, string> = {
    nonmagical: "nonmagical attacks",
    silvered: "nonsilvered attacks",
  };
  Object.entries(creature.nonmagical_attack_modifiers ?? {}).forEach(
    ([type, state]) => {
      const label = NONMAGICAL_LABELS[type] ?? "nonmagical attacks";
      if (state === "resistant") resistances.push(label);
      else if (state === "immune") damageImmunities.push(label);
    },
  );
  const immunities = [...damageImmunities, ...creature.condition_immunities];

  if (resistances.length > 0) {
    lines.push(`**Resistances** :: ${capitalizeWords(resistances.join(", "))}`);
  }
  if (immunities.length > 0) {
    lines.push(`**Immunities** :: ${capitalizeWords(immunities.join(", "))}`);
  }
  if (vulnerabilities.length > 0) {
    lines.push(
      `**Vulnerabilities** :: ${capitalizeWords(vulnerabilities.join(", "))}`,
    );
  }

  const senses: Array<string> = [];
  Object.entries(creature.senses).forEach(([key, value]) => {
    if (!value || key === "is_blind_beyond") return;
    if (key === "blindsight" && creature.senses.is_blind_beyond) {
      senses.push(`${titleCase(key)} ${value} ft. (blind beyond this radius)`);
    } else {
      senses.push(`${titleCase(key)} ${value} ft.`);
    }
  });
  senses.push(`Passive Perception ${creature.passive_perception || 10}`);
  lines.push(`**Senses** :: ${senses.join(", ")}`);

  const languages = [
    ...creature.languages.map((l) => titleCase(l)),
    ...(creature.custom_languages ?? []),
  ];
  if (languages.length > 0) {
    lines.push(`**Languages** :: ${languages.join(", ")}`);
  }

  lines.push(
    `**Challenge** :: ${creature.cr.challenge_rating} (${new Intl.NumberFormat().format(
      creature.cr.experience,
    )} XP; PB ${formatMod(pb)})`,
    "___",
  );

  if (creature.traits.length > 0) {
    lines.push(...featureLines(creature.traits, creature));
  }

  const sections: Array<{
    title: string;
    features: Array<Feature>;
    description?: string;
    enabled?: boolean;
  }> = [
    { title: "Actions", features: creature.actions },
    { title: "Bonus Actions", features: creature.bonus_actions },
    { title: "Reactions", features: creature.reactions },
    {
      title: "Legendary Actions",
      features: creature.legendary_actions,
      description: creature.legendary_description,
      enabled: creature.is_legendary,
    },
    {
      title: "Mythic Actions",
      features: creature.mythic_actions,
      description: creature.mythic_description,
      enabled: creature.is_mythic,
    },
    {
      title: "Lair Actions",
      features: creature.lair_actions,
      description: creature.lair_description,
      enabled: creature.has_lair,
    },
  ];

  for (const section of sections) {
    if (section.enabled === false) continue;
    if (section.features.length === 0) continue;
    lines.push(`### ${section.title}`);
    if (section.description) {
      lines.push(resolveMarkup(section.description, creature), ":");
    }
    lines.push(...featureLines(section.features, creature));
  }

  lines.push("}}");
  return lines.join("\n");
}
