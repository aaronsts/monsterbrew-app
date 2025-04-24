import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  abilityScoresSchema,
  createCreatureSchema,
} from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function SavingThrowsForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const saves = abilityScoresSchema
    .keyof()
    ._def.values.map((save) => ({ label: save.toUpperCase(), value: save }));

  return (
    <FormField
      control={form.control}
      name="saving_throws"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Saving Throws</FormLabel>
          <FormControl>
            <MultiSelect
              title="Select ability"
              options={saves}
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

export default SavingThrowsForm;
