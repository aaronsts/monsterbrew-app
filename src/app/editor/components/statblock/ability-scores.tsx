import { calculateStatBonus } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function AbilityScores() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  const abilityScores = creature.ability_scores
    ? Object.entries(creature.ability_scores).map((score) => ({
        label: score[0].slice(0, 3).toUpperCase(),
        value: score[1],
      }))
    : [];

  return (
    <div className="grid grid-cols-3 w-fit lg:grid-cols-6 gap-8">
      {abilityScores.map((score) => (
        <div key={score.label} className="grid place-items-center w-fit">
          <h4>{score.label}</h4>
          <p>
            {score.value || "0"} {calculateStatBonus(score.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
