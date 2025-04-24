import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { CONDITIONS } from "@/types/types";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function ConditionTypesForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const conditions = CONDITIONS.map((con) => ({
    label: con.label,
    value: con.value,
  }));

  return (
    <FormField
      control={form.control}
      name="condition_immunities"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Condition Immunities</FormLabel>
          <FormControl>
            <MultiSelect
              title="Select conditions"
              options={conditions}
              selectedValues={new Set(field.value)}
              onSelectionChange={(selectedValues) => {
                field.onChange(Array.from(selectedValues));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ConditionTypesForm;
