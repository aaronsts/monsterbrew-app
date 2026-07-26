import { Controller, useFormContext } from "react-hook-form";
import { formatModifier } from "./helpers";
import type { Monster } from "@/schema/monster-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ABILITY_SCORES } from "@/lib/abilities";
import { calculateStatBonus, cn } from "@/lib/utils";

export function SavingThrowsField() {
  const form = useFormContext<Monster>();
  const scores = form.watch("ability_scores");
  const profBonus = form.watch("cr.proficiency_bonus");

  return (
    <FieldGroup>
      <FieldLabel className="-mb-1">Saving Throws</FieldLabel>
      <div className="grid grid-cols-3 gap-1 xl:grid-cols-6">
        {ABILITY_SCORES.map((ability) => (
          <Controller
            key={ability}
            name={`saving_throws.${ability}`}
            control={form.control}
            render={({ field }) => {
              const baseMod = calculateStatBonus(scores?.[ability]);
              const total = field.value ? baseMod + (profBonus || 0) : baseMod;
              return (
                <Field
                  orientation="horizontal"
                  className="items-center px-2 py-1.5 hover:bg-muted"
                >
                  <Checkbox
                    id={`form-rhf-save-${ability}`}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel
                    htmlFor={`form-rhf-save-${ability}`}
                    className={cn(
                      "flex-1 cursor-pointer font-normal uppercase",
                      field.value ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {ability}
                  </FieldLabel>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      field.value ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {formatModifier(total)}
                  </span>
                </Field>
              );
            }}
          />
        ))}
      </div>
    </FieldGroup>
  );
}
