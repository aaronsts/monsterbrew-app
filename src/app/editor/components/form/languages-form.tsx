import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import SelectBox from "@/components/ui/multi-select";
import { cn, titleCase } from "@/lib/utils";
import { createCreatureSchema, Languages } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function LanguagesForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const languages = Object.keys(Languages).map((lang) => ({
    label: titleCase(lang) as string,
    value: lang as string,
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
              <SelectBox
                options={languages}
                value={field.value as unknown as string}
                onChange={field.onChange}
                placeholder="Select languages..."
                inputPlaceholder="Search language"
                emptyPlaceholder="No language found."
                multiple
                search
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default LanguagesForm;
