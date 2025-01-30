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
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

export function FeatureForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const moveUp = (index: number) => {
    if (index > 0) swap(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < fields.length - 1) swap(index, index + 1);
  };

  return (
    <>
      {" "}
      <Button
        type="button"
        onClick={() => append({ name: "", description: "" })}
      >
        Add Item
      </Button>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded">
          <div className="flex justify-between mb-2">
            <h4>Item {index + 1}</h4>
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="disabled:opacity-50"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === fields.length - 1}
              className="disabled:opacity-50"
            >
              ↓
            </button>
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
          <FormField
            control={form.control}
            name={`actions.${index}.name`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Creature Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`actions.${index}.description`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Creature Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </>
  );
}
