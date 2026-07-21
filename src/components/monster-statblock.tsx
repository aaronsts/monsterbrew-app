"use client";

import { Fragment } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StandAloneDescription as Description } from "@/components/ui/stand-alone-description";
import {
  calculateHitPoints,
  calculateStatBonus,
  cn,
  titleCase,
} from "@/lib/utils";
import { SKILLS } from "@/lib/skills";
import { abilityScoresSchema, Monster } from "@/schema/monster-schema";

type Feature = Monster["traits"][number];

const ABILITY_KEYS = abilityScoresSchema.keyof().options;
const SKILL_ABILITY = new Map<string, string>(
  SKILLS.map((s) => [s.skill_name, s.skill_modifier]),
);

function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Statblock divider bar, tinted to the theme accent and fading out to the right. */
function TaperedRule({ thin = false }: { thin?: boolean }) {
  return (
    <div
      className={cn(
        "w-full bg-linear-to-r from-primary to-transparent",
        thin ? "h-[2px]" : "h-1",
      )}
      aria-hidden
    />
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-primary">
        {children}
      </h3>
      <TaperedRule thin />
    </div>
  );
}

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
      <span className="font-semibold text-foreground">{label} </span>
      <span>{value}</span>
    </p>
  );
}

function TraitList({ features }: { features: Feature[] }) {
  return (
    <div className="flex flex-col gap-3">
      {features.map((feature, i) => (
        <Description
          key={feature.name + i}
          title={feature.name}
          description={feature.description}
        />
      ))}
    </div>
  );
}

function FeatureSection({
  title,
  features,
  description,
}: {
  title: string;
  features: Feature[];
  description?: string;
}) {
  if (features.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>{title}</SectionHeading>
      {description && (
        <p className="italic mb-1 whitespace-pre-wrap">{description}</p>
      )}
      <TraitList features={features} />
    </div>
  );
}

export function MonsterStatblock({
  creature,
  columns = false,
}: {
  creature: Monster;
  /** Flow the statblock body into two columns on desktop (single column on mobile). */
  columns?: boolean;
}) {
  const pb = creature.cr.proficiency_bonus || 0;
  const initMod = calculateStatBonus(creature.ability_scores.dex);

  const medianHP = calculateHitPoints(
    creature.hit_dice,
    creature.size,
    creature.ability_scores.con,
  );
  const hp = creature.custom_hp
    ? creature.hit_points
    : medianHP || creature.hit_points;

  const movements: string[] = [];
  Object.entries(creature.movements).forEach(([key, value]) => {
    if (!value) return;
    movements.push(
      key === "walk" ? `${value} ft.` : `${titleCase(key)} ${value} ft.`,
    );
  });

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
      return `${titleCase(name)} ${formatMod(bonus)}`;
    },
  );

  const resistances: string[] = [];
  const damageImmunities: string[] = [];
  const vulnerabilities: string[] = [];
  Object.entries(creature.damage_modifiers ?? {}).forEach(([type, state]) => {
    if (state === "resistant") resistances.push(type);
    else if (state === "immune") damageImmunities.push(type);
    else if (state === "vulnerable") vulnerabilities.push(type);
  });
  if (creature.nonmagical_attack_resistance)
    resistances.push("nonmagical attacks");
  if (creature.nonmagical_attack_immunity)
    damageImmunities.push("nonmagical attacks");

  const immunities = [...damageImmunities, ...creature.condition_immunities];

  const senses: string[] = [];
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
    <Card className="h-fit gap-0 py-0 text-[13px]/relaxed">
      {/* Name banner */}
      <CardHeader className="pt-4">
        <h2
          data-slot="card-title"
          className="mb-0 font-heading text-2xl leading-none font-bold tracking-wide text-primary"
        >
          {creature.name || "Example Creature"}
        </h2>
        <p className="mt-1 capitalize italic text-muted-foreground">
          {creature.size || "Size"} {creature.type || "Type"},{" "}
          {creature.alignment || "Alignment"}
        </p>
      </CardHeader>

      <CardContent
        className={cn(
          "pb-4",
          columns
            ? "md:columns-2 md:gap-x-8 [&>*+*]:mt-2 md:[&>*]:break-inside-avoid"
            : "flex flex-col gap-2",
        )}
      >
        <TaperedRule />

        {/* Defenses & speed */}
        <div>
          <div className="flex flex-wrap gap-x-6">
            <StatLine label="AC" value={creature.armor_class} />
            <StatLine
              label="Initiative"
              value={`${formatMod(initMod)} (${10 + initMod})`}
            />
          </div>
          <StatLine label="HP" value={hp.toString() || "15 (2d8 + 6)"} />
          <StatLine label="Speed" value={movements.join(", ") || "30 ft."} />
        </div>

        <TaperedRule />

        {/* Ability scores — 5e 2024 two-group layout */}
        <div className="grid grid-cols-2 py-1">
          {abilityGroups.map((group, gi) => (
            <div
              key={gi}
              className={cn(
                "grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-1",
                gi === 1
                  ? "border-l border-primary/20 pl-4"
                  : "pr-4",
              )}
            >
              <span />
              <span className="text-right font-heading text-[10px] font-semibold uppercase tracking-wide text-primary">
                Mod
              </span>
              <span className="text-right font-heading text-[10px] font-semibold uppercase tracking-wide text-primary">
                Save
              </span>
              {group.map((score) => {
                const mod = calculateStatBonus(score.value);
                const save =
                  mod + (creature.saving_throws[score.key] ? pb : 0);
                return (
                  <Fragment key={score.key}>
                    <span>
                      <span className="font-heading font-semibold text-primary">
                        {score.label}
                      </span>{" "}
                      {score.value || 0}
                    </span>
                    <span className="text-right tabular-nums">
                      {formatMod(mod)}
                    </span>
                    <span className="text-right tabular-nums">
                      {formatMod(save)}
                    </span>
                  </Fragment>
                );
              })}
            </div>
          ))}
        </div>

        <TaperedRule />

        {/* Characteristics */}
        <div>
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
            value={`${creature.cr.challenge_rating} (XP ${new Intl.NumberFormat().format(
              creature.cr.experience,
            )}; PB ${formatMod(pb)})`}
          />
        </div>

        {/* Traits — 5e 2024 shows these with no heading, above Actions */}
        {creature.traits.length > 0 && (
          <div className="mt-1 flex flex-col gap-3">
            <TaperedRule />
            <TraitList features={creature.traits} />
          </div>
        )}

        {/* Actions & reactions */}
        <div className="mt-3 flex flex-col gap-5">
          <FeatureSection title="Actions" features={creature.actions} />
          <FeatureSection
            title="Bonus Actions"
            features={creature.bonus_actions}
          />
          <FeatureSection title="Reactions" features={creature.reactions} />
          {creature.is_legendary && (
            <FeatureSection
              title="Legendary Actions"
              features={creature.legendary_actions}
              description={creature.legendary_description}
            />
          )}
          {creature.is_mythic && (
            <FeatureSection
              title="Mythic Actions"
              features={creature.mythic_actions}
              description={creature.mythic_description}
            />
          )}
          {creature.has_lair && (
            <FeatureSection
              title="Lair Actions"
              features={creature.lair_actions}
              description={creature.lair_description}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
