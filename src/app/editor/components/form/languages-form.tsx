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

import { cn, titleCase } from "@/lib/utils";
import { createCreatureSchema, Languages } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function LanguagesForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const languages = Object.keys(Languages).map((lang) => ({
    label: titleCase(lang),
    value: lang.toLowerCase(),
  }));

  return (
    <div className="relative grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name="languages"
        render={({ field }) => (
          <FormItem className={cn("h-fit col-span-2")}>
            <FormLabel>Languages</FormLabel>
            <FormControl>
              <Combobox
                items={languages}
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
    </div>
  );
}

export default LanguagesForm;
