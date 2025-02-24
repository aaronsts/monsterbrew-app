import { Description } from "@/components/ui/description";
import { titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Features() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

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
        return `${titleCase(skl.skill_name)} +${profBonus + bonus}`;
      })
    : [];

  const senses: string[] = [];
  if (creature.senses) {
    Object.entries(creature.senses).forEach((m) => {
      const isBlindBeyond = watch("senses.is_blind_beyond");
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
    <div>
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
          ${new Intl.NumberFormat().format(creature.cr.experience)}; PB +${
          creature.cr.proficiency_bonus
        })`}
        className="mt-1.5"
      />
    </div>
  );
}
