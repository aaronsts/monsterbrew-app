import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { calculateStatBonus } from "@/lib/utils";
import {
  abilityScoresSchema,
  createCreatureSchema,
} from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function AbilityScoresForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const abilityScoreValues = form.watch("ability_scores");
  const abilityScores = abilityScoresSchema.keyof()._def.values;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 py-3">
      {abilityScores.map((ability) => (
        <FormField
          key={ability}
          control={form.control}
          name={`ability_scores.${ability}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {ability.toUpperCase().slice(0, 3)}{" "}
                <span className="text-muted-foreground/60">
                  (
                  {abilityScoreValues &&
                  calculateStatBonus(abilityScoreValues[ability]) >= 0
                    ? `+${calculateStatBonus(abilityScoreValues[ability])}`
                    : calculateStatBonus(abilityScoreValues[ability])}
                  )
                </span>
              </FormLabel>
              <FormControl>
                <NumberInput
                  {...field}
                  onFocus={(e) => e.target.select()}
                  placeholder="10"
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}

export default AbilityScoresForm;
