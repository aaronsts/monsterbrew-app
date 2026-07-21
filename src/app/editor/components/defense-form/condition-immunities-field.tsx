import { Controller, useFormContext } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { CONDITIONS } from "@/types/types";

export function ConditionImmunitiesField() {
  const form = useFormContext<Monster>();

  return (
    <Controller
      name="condition_immunities"
      control={form.control}
      render={({ field }) => {
        const selected = field.value ?? [];
        return (
          <FieldGroup>
            <FieldLabel className="-mb-1">Condition Immunities</FieldLabel>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 xl:grid-cols-5">
              {CONDITIONS.map((condition) => {
                const active = selected.includes(condition.value);
                const id = `form-rhf-condition-${condition.value}`;
                return (
                  <Field
                    key={condition.value}
                    orientation="horizontal"
                    className="w-auto items-center"
                  >
                    <Checkbox
                      id={id}
                      checked={active}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...selected, condition.value]
                            : selected.filter((c) => c !== condition.value),
                        )
                      }
                    />
                    <FieldLabel htmlFor={id} className="font-normal">
                      {condition.label}
                    </FieldLabel>
                  </Field>
                );
              })}
            </div>
          </FieldGroup>
        );
      }}
    />
  );
}
