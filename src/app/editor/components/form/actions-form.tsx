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

export function ActionsForm() {
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
    <div className="grid gap-3">
      <Button
        className=" ml-auto"
        type="button"
        onClick={() => append({ name: "", description: "" })}
      >
        Add Action
      </Button>
      {fields.map((field, index) => (
        <div key={field.id} className=" border p-3 rounded">
          <div className="flex justify-between">
            <h4>Feature {index + 1}</h4>
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
                <span className="sr-only">Remove Feature</span>
                <Trash2 />
              </Button>
            </div>
          </div>
          <div className="grid gap-y-2">
            <FormField
              control={form.control}
              name={`actions.${index}.name`}
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
              name={`actions.${index}.description`}
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
