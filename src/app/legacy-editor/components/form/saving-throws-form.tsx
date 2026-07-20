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
            <Combobox
              items={saves}
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

export default SavingThrowsForm;
