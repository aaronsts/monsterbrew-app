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
import { CONDITIONS, Option } from "@/types/types";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function ConditionTypesForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  return (
    <FormField
      control={form.control}
      name="condition_immunities"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Condition Immunities</FormLabel>
          <FormControl>
            <SelectBox
              options={CONDITIONS}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select condition..."
              multiple
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ConditionTypesForm;
