import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
import { titleCase } from "@/lib/utils";
import {
  createCreatureSchema,
  sensesSchema,
} from "@/schema/createCreatureSchema";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function SensesForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const customPassivePerception = form.watch("custom_passive_perception");

  const senses = sensesSchema
    .keyof()
    ._def.values.filter((sense) => sense !== "is_blind_beyond");

  useEffect(() => {
    if (!customPassivePerception) {
      form.setValue("passive_perception", 10);
    }
  }, [customPassivePerception]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
      {senses.map((sense) => (
        <FormField
          key={sense}
          control={form.control}
          name={`senses.${sense}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {titleCase(sense)}{" "}
                <span className="text-xs text-carrara-600">(ft.)</span>
              </FormLabel>
              <FormControl>
                <NumberInput
                  onFocus={(e) => e.target.select()}
                  placeholder="10"
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={form.control}
        name="senses.is_blind_beyond"
        render={({ field }) => (
          <FormItem className="flex col-span-2 lg:col-span-1 gap-2 space-y-0 items-center">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="text-xs leading-none">
              Blind beyond this radius
            </FormLabel>
          </FormItem>
        )}
      />
      <div className="col-span-4 flex gap-3 items-end pt-3">
        <FormField
          control={form.control}
          name="passive_perception"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passive Perception</FormLabel>
              <FormControl>
                <NumberInput
                  onFocus={(e) => e.target.select()}
                  placeholder="10"
                  type="number"
                  disabled={!customPassivePerception}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="custom_passive_perception"
          render={({ field }) => (
            <FormItem className="pb-2.5 flex col-span-2 lg:col-span-1 gap-2 space-y-0 items-center">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-xs leading-none">
                Custom Passive Perception
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default SensesForm;
