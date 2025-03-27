import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SelectBox from "@/components/ui/multi-select";
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
            <SelectBox
              options={saves}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select ability..."
              multiple
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SavingThrowsForm;
