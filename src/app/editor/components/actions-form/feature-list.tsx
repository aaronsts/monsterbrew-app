import { Controller, useFieldArray } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { MarkupField } from "./markup/markup-field";
import { PresetPicker } from "./preset-picker";
import type { Control } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import type { MarkupContext } from "@/lib/statblock-markup";
import type { TagItem } from "@/lib/tag-catalog";
import type { FeaturePreset } from "@/lib/constants/actionPresets";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FeatureArrayName =
  | "traits"
  | "actions"
  | "reactions"
  | "bonus_actions"
  | "lair_actions"
  | "legendary_actions"
  | "mythic_actions";

type DescriptionName =
  | "lair_description"
  | "legendary_description"
  | "mythic_description";

interface FeatureListProps {
  control: Control<Monster>;
  name: FeatureArrayName;
  itemLabel: string;
  addLabel: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  title?: string;
  descriptionName?: DescriptionName;
  descriptionLabel?: string;
  ctx: MarkupContext;
  tags?: Array<TagItem>;
  presets?: Array<FeaturePreset>;
}

export function FeatureList({
  control,
  name,
  itemLabel,
  addLabel,
  namePlaceholder,
  descriptionPlaceholder,
  title,
  descriptionName,
  descriptionLabel,
  ctx,
  tags,
  presets,
}: FeatureListProps) {
  const { fields, append, remove, swap } = useFieldArray({ control, name });

  return (
    <FieldGroup className="gap-3">
      <div className="flex items-center justify-between gap-2">
        {title ? <FieldLabel className="mb-0">{title}</FieldLabel> : <span />}
        <div className="flex items-center gap-2">
          {presets && presets.length > 0 && (
            <PresetPicker
              presets={presets}
              triggerLabel="Insert preset"
              onSelect={(preset) =>
                append({ name: preset.name, description: preset.description })
              }
            />
          )}
          <Button
            type="button"
            color="neutral"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", description: "" })}
          >
            <Plus />
            {addLabel}
          </Button>
        </div>
      </div>

      {descriptionName && (
        <Controller
          control={control}
          name={descriptionName}
          render={({ field }) => (
            <Field>
              {descriptionLabel && (
                <FieldLabel htmlFor={`form-rhf-${descriptionName}`}>
                  {descriptionLabel}
                </FieldLabel>
              )}
              <Textarea
                {...field}
                id={`form-rhf-${descriptionName}`}
                placeholder="Describe how these actions work…"
              />
            </Field>
          )}
        />
      )}

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No {itemLabel.toLowerCase()}s yet.
        </p>
      ) : (
        fields.map((item, index) => (
          <div key={item.id} className="border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {itemLabel} #{index + 1}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  color="neutral"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => swap(index, index - 1)}
                >
                  <span className="sr-only">Move up</span>
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  color="neutral"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === fields.length - 1}
                  onClick={() => swap(index, index + 1)}
                >
                  <span className="sr-only">Move down</span>
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  color="neutral"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                >
                  <span className="sr-only">
                    Remove {itemLabel.toLowerCase()}
                  </span>
                  <Trash2 />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Controller
                control={control}
                name={`${name}.${index}.name`}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={`form-rhf-${name}-${index}-name`}>
                      Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`form-rhf-${name}-${index}-name`}
                      placeholder={namePlaceholder}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`${name}.${index}.description`}
                render={({ field }) => (
                  <Field>
                    <FieldLabel
                      htmlFor={`form-rhf-${name}-${index}-description`}
                    >
                      Description
                    </FieldLabel>
                    <MarkupField
                      id={`form-rhf-${name}-${index}-description`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={descriptionPlaceholder}
                      ctx={ctx}
                      tags={tags}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        ))
      )}
    </FieldGroup>
  );
}
