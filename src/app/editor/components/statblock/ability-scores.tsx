import { calculateSavingThrow, calculateStatBonus } from "@/lib/utils";
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
    <div className="grid grid-cols-2 w-full rounded-md overflow-hidden gap-px border bg-black/10">
      <div className="grid col-span-2 bg-background grid-cols-2 text-xs font-semibold">
        <div className="grid px-4 grid-cols-4 py-0.5 gap-3">
          <span className="col-start-3">MOD</span>
          <span className="col-start-4">SAVE</span>
        </div>
        <div className="grid px-4 grid-cols-4 py-0.5 gap-3">
          <span className="col-start-3">MOD</span>
          <span className="col-start-4">SAVE</span>
        </div>
      </div>
      {abilityScores.map((score) => (
        <div
          key={score.label}
          className="grid grid-cols-4 w-full bg-background gap-3  px-4 py-1"
        >
          <h4>{score.label}</h4>
          <p>{score.value || "0"}</p>
          <p>
            {calculateStatBonus(score.value) >= 0
              ? `+${calculateStatBonus(score.value)}`
              : `${calculateStatBonus(score.value)}`}
          </p>
          <p>{calculateSavingThrow(score, creature)}</p>
        </div>
      ))}
    </div>
  );
}
