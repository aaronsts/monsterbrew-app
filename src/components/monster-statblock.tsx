"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StandAloneDescription as Description } from "@/components/ui/stand-alone-description";
import { calculateHitPoints, calculateStatBonus, titleCase } from "@/lib/utils";
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
      <h3 className="border-b border-carrara-600">{title}</h3>
      {description && (
        <p className="italic mb-2 whitespace-pre-wrap">{description}</p>
      )}
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

export function MonsterStatblock({ creature }: { creature: Monster }) {
  const pb = creature.cr.proficiency_bonus || 0;

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
    movements.push(key === "walk" ? `${value} ft.` : `${key} ${value} ft.`);
  });

  const abilityScores = ABILITY_KEYS.map((key) => ({
    key,
    label: key.toUpperCase(),
    value: creature.ability_scores[key],
  }));

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
    <Card className="h-fit">
      <CardContent className="md:columns-2">
        <div className="mb-4 border-b pb-2">
          <CardTitle>{creature.name || "Example Creature"}</CardTitle>
          <p className="capitalize italic font-medium text-carrara-600">
            {creature.size || "Size"} {creature.type || "Type"},{" "}
            {creature.alignment || "Alignment"}
          </p>
        </div>
        <div className="mb-2">
          <div className="flex gap-1.5">
            <Description
              title="AC"
              description={creature.armor_class.toString()}
              placeholder="10"
            />
            <Description
              title="Initiative"
              description={formatMod(
                calculateStatBonus(creature.ability_scores.dex),
              )}
            />
          </div>
          <Description
            title="HP"
            description={hp.toString()}
            placeholder="15 (2d8 + 6)"
          />
          <Description
            title="Speed"
            description={movements.join(", ")}
            placeholder="30 ft."
          />
        </div>
        {/* Ability Scores */}
        <div className="grid lg:grid-cols-2 w-full border-carrara-600  overflow-hidden gap-px border bg-carrara-200 mb-2">
          <div className="grid lg:col-span-2 bg-carrara-200 lg:grid-cols-2 text-xs font-semibold">
            <div className="hidden lg:grid px-4 grid-cols-4 py-0.5 gap-3">
              <span className="col-start-3">MOD</span>
              <span className="col-start-4">SAVE</span>
            </div>
            <div className="grid px-4 grid-cols-4 py-0.5 gap-3">
              <span className="col-start-3">MOD</span>
              <span className="col-start-4">SAVE</span>
            </div>
          </div>
          {abilityScores.map((score) => {
            const mod = calculateStatBonus(score.value);
            const save = mod + (creature.saving_throws[score.key] ? pb : 0);
            return (
              <div
                key={score.label}
                className="grid grid-cols-4 w-full bg-white gap-3 px-4 py-1"
              >
                <h4>{score.label}</h4>
                <p>{score.value || "0"}</p>
                <p>{formatMod(mod)}</p>
                <p>{formatMod(save)}</p>
              </div>
            );
          })}
        </div>
        {/* Features */}
        <div className="mb-4">
          <Description
            title="Skills"
            description={skillSaves.join(", ")}
            show={skillSaves.length > 0}
          />
          <Description
            className="capitalize"
            title="Resistances"
            description={resistances.join(", ")}
            show={resistances.length > 0}
          />
          <Description
            className="capitalize"
            title="Immunities"
            description={immunities.join(", ")}
            show={immunities.length > 0}
          />
          <Description
            className="capitalize"
            title="Vulnerabilities"
            description={vulnerabilities.join(", ")}
            show={vulnerabilities.length > 0}
          />
          <Description
            title="Senses"
            description={`${senses
              .map((l) => titleCase(l))
              .join(", ")} Passive perception ${
              creature.passive_perception || 10
            }`}
          />
          <Description
            title="Languages"
            description={[
              ...creature.languages.map((l) => titleCase(l)),
              ...(creature.custom_languages ?? []),
            ].join(", ")}
            show={
              creature.languages.length > 0 ||
              (creature.custom_languages?.length ?? 0) > 0
            }
          />
          <Description
            title="CR"
            description={`${creature.cr.challenge_rating} (XP ${new Intl.NumberFormat().format(
              creature.cr.experience,
            )}; PB ${formatMod(pb)})`}
            className="mt-1.5 whitespace-nowrap"
          />
        </div>
        <div className="flex flex-col gap-6 my-3">
          <FeatureSection title="Traits" features={creature.traits} />
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
