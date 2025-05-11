import { FieldArrayButtons } from "@/components/field-array-buttons";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combo-box";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACTION_PRESETS } from "@/lib/constants/actionPresets";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

export function ActionsForm() {
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
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

  function onChange(value: string) {
    setSelectedAction(value);
  }

  function addAction() {
    if (!selectedAction) return append({ name: "", description: "" });

    const action = ACTION_PRESETS.find((a) => a.name === selectedAction);

    if (!action) return;

    append({
      name: action.name,
      description: action.desc,
    });

    setSelectedAction(undefined);
  }

  return (
    <div className="grid gap-3">
      <div className="flex justify-end gap-2">
        <Combobox
          placeholder="Action presets ..."
          value={selectedAction}
          onChange={onChange}
          options={ACTION_PRESETS.filter((a) => a.type === "action").map(
            (a) => ({
              label: a.name,
              value: a.name,
            })
          )}
        />
        <Button
          variant="light"
          color="carrara"
          type="button"
          onClick={addAction}
        >
          Add Action
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className=" border p-3 rounded">
          <div className="flex justify-between">
            <h4>Action {index + 1}</h4>
            <FieldArrayButtons
              index={index}
              moveUp={moveUp}
              moveDown={moveDown}
              remove={remove}
              fields={fields}
            />
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
