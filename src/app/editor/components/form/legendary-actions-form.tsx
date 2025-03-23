import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

export function LegendaryActionsForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "legendary_actions",
  });

  const moveUp = (index: number) => {
    if (index > 0) swap(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < fields.length - 1) swap(index, index + 1);
  };

  return (
    <div className="grid gap-3">
      <Button
        className="ml-auto"
        variant="outline"
        type="button"
        onClick={() => append({ name: "", description: "" })}
      >
        Add L. Action
      </Button>

      <div>
        <FormField
          control={form.control}
          name="legendary_description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Legendary Description</FormLabel>

              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className=" border p-3 rounded">
          <div className="flex justify-between">
            <h4>Legendary Action {index + 1}</h4>
            <div className="flex gap-1 items-centers">
              <Button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="disabled:opacity-50"
                variant="ghost"
                size="icon"
              >
                ↑
              </Button>
              <Button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === fields.length - 1}
                className="disabled:opacity-50"
                variant="ghost"
                size="icon"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
              >
                <span className="sr-only">Remove</span>
                <Trash2 />
              </Button>
            </div>
          </div>
          <div className="grid gap-y-2">
            <FormField
              control={form.control}
              name={`legendary_actions.${index}.name`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`legendary_actions.${index}.description`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
