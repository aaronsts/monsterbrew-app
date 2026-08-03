"use client";

import { Fragment } from "react";
import { FeatureSection } from "./statblock/feature-section";
import type { Monster } from "@/schema/monster-schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SKILLS } from "@/lib/skills";
import {
  calculateHitPoints,
  calculateStatBonus,
  capitalizeWords,
  cn,
  formatMod,
  formatMovements,
  titleCase,
} from "@/lib/utils";
import { abilityScoresSchema, defaultMonster } from "@/schema/monster-schema";

export type Feature = Monster["traits"][number];

const ABILITY_KEYS = abilityScoresSchema.keyof().options;
const SKILL_ABILITY = new Map<string, string>(
  SKILLS.map((s) => [s.skill_name, s.skill_modifier]),
);
const SKILL_LABEL = new Map<string, string>(
  SKILLS.map((s) => [s.skill_name, s.label]),
);

/** A single "**Label** value" line as used throughout the 5e 2024 header block. */
function StatLine({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("whitespace-normal", className)}>
      <span className="font-black text-accent-700 dark:text-accent-500">
        {label}{" "}
      </span>
      <span>{value}</span>
    </p>
  );
}

export function MonsterStatblock({
  creature,
  columns = false,
}: {
  creature: Monster;
  columns?: boolean;
}) {
  const cr = creature.cr ?? defaultMonster.cr;
  const pb = cr.proficiency_bonus || 0;
  const initMod = creature.custom_initiative
    ? Number(creature.initiative_bonus) || 0
    : calculateStatBonus(creature.ability_scores.dex);

  const medianHP = calculateHitPoints(
    creature.hit_dice,
    creature.size,
    creature.ability_scores.con,
  );
  const hp = creature.custom_hp
    ? creature.hit_points
    : medianHP || creature.hit_points;

  const movements = formatMovements(creature.movements);

  const abilityScores = ABILITY_KEYS.map((key) => ({
    key,
    label: key.toUpperCase(),
    value: creature.ability_scores[key],
  }));
  // 5e 2024 lays the six abilities out as two groups of three side by side.
  const abilityGroups = [abilityScores.slice(0, 3), abilityScores.slice(3, 6)];

  const skillSaves = Object.entries(creature.skills ?? {}).map(
    ([name, level]) => {
      const abilityKey = SKILL_ABILITY.get(name) ?? "dex";
      const mod = calculateStatBonus(
        creature.ability_scores[abilityKey as (typeof ABILITY_KEYS)[number]],
      );
      const bonus = mod + (level === "expert" ? pb * 2 : pb);
      return `${SKILL_LABEL.get(name) ?? capitalizeWords(name)} ${formatMod(bonus)}`;
    },
  );

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

  const senses: Array<string> = [];
  Object.entries(creature.senses).forEach(([key, value]) => {
    if (!value) return;
    if (key === "is_blind_beyond") return;
    if (key === "blindsight") {
      senses.push(
        creature.senses.is_blind_beyond
          ? `${key} ${value} ft. (blind beyond this radius)`
          : `${key} ${value} ft.`,
      );
    } else {
      senses.push(`${key} ${value} ft.`);
    }
  });

  return (
    <Card className="h-fit gap-0 py-0 text-[13px]">
      {/* Name banner */}
      <CardHeader className="pt-4 pb-2 gap-0">
        <h2
          data-slot="card-title"
          className="mb-0 border-b border-accent-700 pb-1 font-heading text-2xl leading-none font-bold tracking-wide [font-variant-caps:small-caps] text-accent-700 dark:text-accent-500"
        >
          {creature.name || "Example Creature"}
        </h2>

        <p className="mt-1 capitalize italic text-muted-foreground">
          {creature.size || "Size"} {creature.type || "Type"}
          {creature.sub_type ? ` (${creature.sub_type})` : ""},{" "}
          {creature.alignment || "Alignment"}
        </p>
      </CardHeader>

      <CardContent
        className={cn(
          "pb-4",
          columns
            ? "md:columns-2 md:gap-x-8 [&>*+*]:mt-3"
            : "flex flex-col gap-3",
        )}
      >
        {/* Defenses & speed */}
        <div className="md:break-inside-avoid">
          <div className="flex flex-wrap gap-x-6">
            <StatLine
              label="AC"
              value={
                creature.armor_description
                  ? `${creature.armor_class} (${creature.armor_description})`
                  : creature.armor_class
              }
            />
            <StatLine
              label="Initiative"
              value={`${formatMod(initMod)} (${10 + initMod})`}
            />
          </div>
          <StatLine label="HP" value={hp.toString() || "15 (2d8 + 6)"} />
          <StatLine label="Speed" value={movements.join(", ") || "30 ft."} />
        </div>

        <div className="grid max-w-md grid-cols-2 gap-x-3 py-1 md:break-inside-avoid">
          {abilityGroups.map((group, gi) => {
            const scoreTint =
              gi === 0
                ? "bg-accent-500/10 dark:bg-accent-500/20"
                : "bg-success-500/10 dark:bg-success-500/20";
            const saveTint =
              gi === 0
                ? "bg-accent-500/20 dark:bg-accent-500/30"
                : "bg-success-500/20 dark:bg-success-500/30";
            return (
              <div
                key={gi}
                className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-y-px"
              >
                <span className="col-span-2" />
                <span className="pb-0.5 text-center font-heading text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Mod
                </span>
                <span className="pb-0.5 text-center font-heading text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Save
                </span>
                {group.map((score) => {
                  const mod = calculateStatBonus(score.value);
                  const save =
                    mod + (creature.saving_throws[score.key] ? pb : 0);
                  return (
                    <Fragment key={score.key}>
                      <span
                        className={cn(
                          "py-0.5 pl-2 font-heading font-semibold text-accent-700 dark:text-accent-300",
                          scoreTint,
                        )}
                      >
                        {score.label}
                      </span>
                      <span
                        className={cn(
                          "py-0.5 text-center tabular-nums",
                          scoreTint,
                        )}
                      >
                        {score.value || 0}
                      </span>
                      <span
                        className={cn(
                          "py-0.5 text-center tabular-nums",
                          saveTint,
                        )}
                      >
                        {formatMod(mod)}
                      </span>
                      <span
                        className={cn(
                          "py-0.5 text-center tabular-nums",
                          saveTint,
                        )}
                      >
                        {formatMod(save)}
                      </span>
                    </Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Characteristics */}
        <div className="md:break-inside-avoid">
          {skillSaves.length > 0 && (
            <StatLine label="Skills" value={skillSaves.join(", ")} />
          )}
          {resistances.length > 0 && (
            <StatLine
              label="Resistances"
              value={
                <span className="capitalize">{resistances.join(", ")}</span>
              }
            />
          )}
          {immunities.length > 0 && (
            <StatLine
              label="Immunities"
              value={
                <span className="capitalize">{immunities.join(", ")}</span>
              }
            />
          )}
          {vulnerabilities.length > 0 && (
            <StatLine
              label="Vulnerabilities"
              value={
                <span className="capitalize">{vulnerabilities.join(", ")}</span>
              }
            />
          )}
          <StatLine
            label="Senses"
            value={`${senses.map((l) => titleCase(l)).join(", ")} Passive Perception ${
              creature.passive_perception || 10
            }`}
          />
          {(creature.languages.length > 0 ||
            (creature.custom_languages?.length ?? 0) > 0) && (
            <StatLine
              label="Languages"
              value={[
                ...creature.languages.map((l) => titleCase(l)),
                ...(creature.custom_languages ?? []),
              ].join(", ")}
            />
          )}
          <StatLine
            label="CR"
            value={`${cr.challenge_rating} (XP ${new Intl.NumberFormat().format(
              cr.experience,
            )}; PB ${formatMod(pb)})`}
          />
        </div>
        {/* Traits, actions & reactions — block flow so the sections can
            continue across the column break instead of moving wholesale */}
        <div className="mt-1 space-y-6">
          <FeatureSection
            title="Traits"
            features={creature.traits}
            ctx={creature}
          />
          <FeatureSection
            title="Actions"
            features={creature.actions}
            ctx={creature}
          />
          <FeatureSection
            title="Bonus Actions"
            features={creature.bonus_actions}
            ctx={creature}
          />
          <FeatureSection
            title="Reactions"
            features={creature.reactions}
            ctx={creature}
          />
          {creature.is_legendary && (
            <FeatureSection
              title="Legendary Actions"
              features={creature.legendary_actions}
              description={creature.legendary_description}
              ctx={creature}
            />
          )}
          {creature.is_mythic && (
            <FeatureSection
              title="Mythic Actions"
              features={creature.mythic_actions}
              description={creature.mythic_description}
              ctx={creature}
            />
          )}
          {creature.has_lair && (
            <FeatureSection
              title="Lair Actions"
              features={creature.lair_actions}
              description={creature.lair_description}
              ctx={creature}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
