import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function MovementForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      <FormField
        control={form.control}
        name="movements.walk"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Walking <span className="text-xs text-carrara-600">(ft.)</span>
            </FormLabel>
            <FormControl>
              <NumberInput
                onFocus={(e) => e.target.select()}
                type="number"
                placeholder="ex. 0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="movements.swim"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Swimming <span className="text-xs text-carrara-600">(ft.)</span>
            </FormLabel>
            <FormControl>
              <NumberInput
                onFocus={(e) => e.target.select()}
                type="number"
                placeholder="ex. 0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="movements.burrow"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Burrowing <span className="text-xs text-carrara-600">(ft.)</span>
            </FormLabel>
            <FormControl>
              <NumberInput
                onFocus={(e) => e.target.select()}
                type="number"
                placeholder="ex. 0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="movements.climb"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Climbing <span className="text-xs text-carrara-600">(ft.)</span>
            </FormLabel>
            <FormControl>
              <NumberInput
                onFocus={(e) => e.target.select()}
                type="number"
                placeholder="ex. 0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="movements.fly"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Flying <span className="text-xs text-carrara-600">(ft.)</span>
            </FormLabel>
            <FormControl>
              <NumberInput
                onFocus={(e) => e.target.select()}
                type="number"
                placeholder="ex. 0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-end xl:col-start-5">
        <FormField
          control={form.control}
          name="movements.hover"
          render={({ field }) => (
            <FormItem className="flex gap-2 items-center pb-3 xl:pb-0">
              <FormControl>
                <Checkbox
                  className="mb-0"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-xs leading-none">Can hover</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default MovementForm;
