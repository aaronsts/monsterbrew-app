import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
            <Combobox
              items={conditions}
              multiple
              value={field.value}
              onValueChange={field.onChange}
            >
              <ComboboxChips>
                <ComboboxValue>
                  {field.value.map((item) => (
                    <ComboboxChip key={item}>{item}</ComboboxChip>
                  ))}
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Add framework" />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default ConditionTypesForm;
