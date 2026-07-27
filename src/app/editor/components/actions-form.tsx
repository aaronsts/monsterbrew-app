"use client";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { MarkupField } from "./markup-field";
import type { Control } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import type { MarkupContext } from "@/lib/statblock-markup";
import type { TagItem } from "@/lib/tag-catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
}

function FeatureList({
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
}: FeatureListProps) {
  const { fields, append, remove, swap } = useFieldArray({ control, name });

  return (
    <FieldGroup className="gap-3">
      <div className="flex items-center justify-between gap-2">
        {title ? <FieldLabel className="mb-0">{title}</FieldLabel> : <span />}
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

export const ActionsForm = () => {
  const form = useFormContext<Monster>();
  const hasLair = form.watch("has_lair");
  const isLegendary = form.watch("is_legendary");
  const isMythic = form.watch("is_mythic");

  const ability_scores = useWatch({
    control: form.control,
    name: "ability_scores",
  });
  const cr = useWatch({ control: form.control, name: "cr" });
  const ctx: MarkupContext = { ability_scores, cr };

  return (
    <FieldSet>
      <FieldLegend>Actions</FieldLegend>
      <FieldDescription>
        What the creature can do in and out of combat
      </FieldDescription>

      <FeatureList
        control={form.control}
        name="traits"
        title="Traits"
        itemLabel="Trait"
        addLabel="Add trait"
        namePlaceholder="ex. Pack Tactics"
        descriptionPlaceholder="Describe the passive ability… e.g. The wolf has advantage on attack rolls against a creature if at least one ally is within 5 ft. of it."
        tags={[]}
        ctx={ctx}
      />
      <FeatureList
        control={form.control}
        name="actions"
        title="Actions"
        itemLabel="Action"
        addLabel="Add action"
        namePlaceholder="ex. Multiattack"
        descriptionPlaceholder="Describe the action… e.g. {@attack m|str|5|2d8+str|slashing}"
        ctx={ctx}
      />
      <FeatureList
        control={form.control}
        name="reactions"
        title="Reactions"
        itemLabel="Reaction"
        addLabel="Add reaction"
        namePlaceholder="ex. Parry"
        descriptionPlaceholder="Describe the trigger and effect… e.g. Adds 2 to its AC against one melee attack that would hit it."
        ctx={ctx}
      />
      <FeatureList
        control={form.control}
        name="bonus_actions"
        title="Bonus Actions"
        itemLabel="Bonus Action"
        addLabel="Add bonus action"
        namePlaceholder="ex. Nimble Escape"
        descriptionPlaceholder="Describe the bonus action… e.g. Takes the Disengage or Hide action."
        ctx={ctx}
      />

      <FieldSeparator />

      {/* Lair Actions */}
      <FieldGroup className="gap-3">
        <Controller
          name="has_lair"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center">
              <Checkbox
                id="form-rhf-has-lair"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="form-rhf-has-lair" className="mb-0">
                Lair Actions
              </FieldLabel>
            </Field>
          )}
        />
        {hasLair && (
          <FeatureList
            control={form.control}
            name="lair_actions"
            itemLabel="Lair Action"
            addLabel="Add lair action"
            namePlaceholder="ex. Grasping Roots"
            descriptionPlaceholder="Describe the lair effect… e.g. Roots erupt in a 20-foot square; that area becomes difficult terrain."
            descriptionName="lair_description"
            descriptionLabel="Lair Description"
            ctx={ctx}
          />
        )}
      </FieldGroup>

      {/* Legendary Actions */}
      <FieldGroup className="gap-3">
        <Controller
          name="is_legendary"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center">
              <Checkbox
                id="form-rhf-is-legendary"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="form-rhf-is-legendary" className="mb-0">
                Legendary Actions
              </FieldLabel>
            </Field>
          )}
        />
        {isLegendary && (
          <FeatureList
            control={form.control}
            name="legendary_actions"
            itemLabel="Legendary Action"
            addLabel="Add legendary action"
            namePlaceholder="ex. Tail Attack"
            descriptionPlaceholder="Describe the legendary action… e.g. {@attack m|str|10|1d8+str|bludgeoning}"
            descriptionName="legendary_description"
            descriptionLabel="Legendary Description"
            ctx={ctx}
          />
        )}
      </FieldGroup>

      {/* Mythic Actions */}
      <FieldGroup className="gap-3">
        <Controller
          name="is_mythic"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center">
              <Checkbox
                id="form-rhf-is-mythic"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="form-rhf-is-mythic" className="mb-0">
                Mythic Actions
              </FieldLabel>
            </Field>
          )}
        />
        {isMythic && (
          <FeatureList
            control={form.control}
            name="mythic_actions"
            itemLabel="Mythic Action"
            addLabel="Add mythic action"
            namePlaceholder="ex. Blazing Rebirth"
            descriptionPlaceholder="Describe the mythic action… e.g. Regains 50 hit points and stands if prone."
            descriptionName="mythic_description"
            descriptionLabel="Mythic Description"
            ctx={ctx}
          />
        )}
      </FieldGroup>
    </FieldSet>
  );
};
