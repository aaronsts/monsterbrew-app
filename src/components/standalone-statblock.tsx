"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { CREATURE_SIZES } from "@/lib/constants";
import { calculateStatBonus, titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { z } from "zod";

type MonsterbrewCreature = z.infer<typeof createCreatureSchema>;

// CSS for the multi-column layout is in globals.css

export function StandaloneStatblock({
  creature,
}: {
  creature: MonsterbrewCreature;
}) {
  // Basic Info
  function calculateHitPoints(amount: string, constitution?: number) {
    const size = CREATURE_SIZES.find((s) => creature.size === s.value);
    const hit_dice = size?.hit_dice || 4;
    const modifier = calculateStatBonus(constitution);
    const extraHP = modifier * parseInt(amount);
    const hp = parseInt(amount) + Math.floor(hit_dice * parseInt(amount));
    const medianHp = Math.floor(hp / 2 + extraHP);
    if (Number.isNaN(medianHp)) return "";
    return `${medianHp} (${amount}d${hit_dice} + ${extraHP})`;
  }

  const medianHP = calculateHitPoints(
    creature.hit_dice,
    creature.ability_scores.con
  );

  const hp = creature.custom_hp || medianHP || creature.hit_points.toString();

  const movements: string[] = [];
  if (creature.movements) {
    Object.entries(creature.movements).forEach((m) => {
      if (!!m[1]) {
        switch (m[0]) {
          case "walk":
            movements.push(`${m[1]} ft.`);
            break;
          default:
            movements.push(`${m[0]} ${m[1]} ft.`);
            break;
        }
      }
    });
  }

  // Ability Scores
  const abilityScores = creature.ability_scores
    ? Object.entries(creature.ability_scores).map((score) => ({
        label: score[0].slice(0, 3).toUpperCase(),
        value: score[1],
      }))
    : [];

  // Features
  const skillSaves = creature.skill_bonuses
    ? creature.skill_bonuses.map((skl) => {
        const bonus = Math.floor(
          creature.ability_scores[
            skl.skill_modifier as keyof typeof creature.ability_scores
          ] /
            2 -
            5
        );
        const profBonus = skl.is_expert
          ? (creature.cr.proficiency_bonus || 1) * 2
          : creature.cr.proficiency_bonus || 0;
        return `${titleCase(skl.skill_name)} +${
          profBonus + (bonus >= 0 ? bonus : 0)
        }`;
      })
    : [];

  const senses: string[] = [];
  if (creature.senses) {
    Object.entries(creature.senses).forEach((m) => {
      const isBlindBeyond = creature.senses?.is_blind_beyond;
      if (!!m[1]) {
        switch (m[0]) {
          case "blindsight":
            return !!isBlindBeyond
              ? senses.push(`${m[0]} ${m[1]} ft. (blind beyond this radius)`)
              : senses.push(`${m[0]} ${m[1]} ft.`);
          case "is_blind_beyond":
            break;
          default:
            senses.push(`${m[0]} ${m[1]} ft.`);
            break;
        }
      }
    });
  }

  const immunities = [
    ...creature.damage_immunities,
    ...creature.condition_immunities,
  ];
  const showImmunities =
    creature.damage_immunities.length > 0 ||
    creature.condition_immunities.length > 0;

  return (
    <Card className="h-fit bg-background">
      <div className="p-4 columns-2">
        {/* Header - Always full width */}
        <div className="mb-4 border-b pb-2">
          <CardTitle>{creature.name || "Example Creature"}</CardTitle>
          <p className="capitalize italic font-medium text-black/50">
            {creature.size || "Size"} {creature.type || "Type"},{" "}
            {creature.alignment || "Alignment"}
          </p>
        </div>

        <div className="mb-4 break-inside-avoid">
          <div className="flex gap-1.5">
            <Description
              title="AC"
              description={creature.armor_class.toString()}
              placeholder="10"
            />
            <Description
              title="Initiative"
              description={`+${creature.cr.proficiency_bonus.toString()} (${
                creature.cr.proficiency_bonus + 10
              })`}
            />
          </div>
          <Description
            title="HP"
            description={typeof hp === "string" ? hp : hp.toString()}
            placeholder="15 (2d8 + 6)"
          />
          <Description
            title="Speed"
            description={movements.join(", ")}
            placeholder="30 ft."
          />
        </div>

        {/* Ability Scores - Full width */}
        <div className="grid grid-cols-6 w-full rounded-md overflow-hidden gap-px border bg-black/10 mb-4 break-inside-avoid">
          {abilityScores.map((score) => (
            <div
              key={score.label}
              className="flex flex-col items-center bg-background p-2"
            >
              <h4 className="text-sm font-semibold">{score.label}</h4>
              <p className="text-lg">{score.value || "0"}</p>
              <p className="text-xs">
                {calculateStatBonus(score.value) >= 0
                  ? `+${calculateStatBonus(score.value)}`
                  : `${calculateStatBonus(score.value)}`}
              </p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-4 break-inside-avoid">
          <Description
            title="Skills"
            description={skillSaves?.join(", ")}
            show={skillSaves?.length > 0}
          />
          <Description
            className="capitalize"
            title="Resistances"
            description={creature.damage_resistances?.join(", ")}
            show={creature.damage_resistances?.length > 0}
          />
          <Description
            className="capitalize"
            title="Immunities"
            description={immunities?.join(", ")}
            show={showImmunities}
          />
          <Description
            className="capitalize"
            title="Vulnerabilities"
            description={creature.damage_vulnerabilities?.join(", ")}
            show={creature.damage_vulnerabilities?.length > 0}
          />
          <Description
            title="Senses"
            description={`${senses.join(", ")} Passive perception ${
              creature.passive_perception || 10
            }`}
          />
          <Description
            title="Languages"
            description={creature.languages.join(", ")}
            show={creature.languages?.length > 0}
          />
          <Description
            title="CR"
            description={`${creature.cr.challenge_rating} (XP
                  ${new Intl.NumberFormat().format(
                    creature.cr.experience
                  )}; PB +${creature.cr.proficiency_bonus})`}
            className="mt-1.5 whitespace-nowrap"
          />
        </div>

        {/* Traits */}
        {creature.traits.length > 0 && (
          <div className="mb-4 break-inside-avoid">
            <h3 className="text-lg font-bold border-b mb-2">Traits</h3>
            {creature.traits?.map((trait, i) => (
              <Description
                key={trait.name + i}
                title={trait.name}
                description={trait.description}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        {creature.actions.length > 0 && (
          <div className="mb-4 break-inside-avoid">
            <h3 className="text-lg font-bold border-b mb-2">Actions</h3>
            {creature.actions?.map((action, i) => (
              <Description
                key={action.name + i}
                title={action.name}
                description={action.description}
              />
            ))}
          </div>
        )}

        {/* Reactions */}
        {creature.reactions.length > 0 && (
          <div className="mb-4 break-inside-avoid">
            <h3 className="text-lg font-bold border-b mb-2">Reactions</h3>
            {creature.reactions?.map((reaction, i) => (
              <Description
                key={reaction.name + i}
                title={reaction.name}
                description={reaction.description}
              />
            ))}
          </div>
        )}

        {/* Legendary Actions */}
        {creature.legendary_actions.length > 0 && (
          <div className="mb-4 break-inside-avoid">
            <h3 className="text-lg font-bold border-b mb-2">
              Legendary Actions
            </h3>
            <p className="italic mb-2 whitespace-pre-wrap">
              {creature.legendary_description}
            </p>
            {creature.legendary_actions?.map((action, i) => (
              <Description
                key={action.name + i}
                title={action.name}
                description={action.description}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
