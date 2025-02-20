import { CHALLENGE_RATINGS } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Features() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  const cr = CHALLENGE_RATINGS.find(
    (r) => r.challenge_rating === creature.challenge_rating
  );

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
          ? (cr?.proficiency_bonus || 1) * 2
          : cr?.proficiency_bonus || 0;
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

  return (
    <div>
      <div className="flex gap-1.5">
        <h4>Skills</h4>
        <p>
          {skillSaves.length > 0
            ? skillSaves.join(", ")
            : "Perception +16, Stealth +9"}
        </p>
      </div>
      <div className="flex gap-1.5">
        <h4>Immunities</h4>
        <p className="capitalize">
          {creature.damage_immunities?.join(", ") || "Fire"}
        </p>
      </div>
      <div className="flex gap-1.5">
        <h4>Resistances</h4>
        <p className="capitalize">
          {creature.damage_resistances?.join(", ") || ""}
        </p>
      </div>
      <div className="flex gap-1.5">
        <h4>Vulnerabilities</h4>
        <p className="capitalize">
          {creature.damage_vulnerabilities?.join(", ") || ""}
        </p>
      </div>
      <div className="flex gap-1.5">
        <h4>Senses</h4>
        <p className="capitalize">{senses?.join(", ") || "Common, Draconic"}</p>
      </div>
      <div className="flex gap-1.5">
        <h4>Languages</h4>
        <p className="capitalize">
          {creature.languages?.join(", ") || "Common, Draconic"}
        </p>
      </div>
      <div className="flex gap-1.5 mt-1.5">
        <h4>CR</h4>
        <p>
          {cr?.challenge_rating || 24} (XP{" "}
          {new Intl.NumberFormat().format(cr?.experience || 62000)}; PB +{" "}
          {cr?.proficiency_bonus || 7})
        </p>
      </div>
    </div>
  );
}
