"use client";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Control, Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const featureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

// Local, form-scoped schema: the canonical createCreatureSchema is intentionally
// left untouched while the editor migration is in progress. It also has no
// bonus_actions / lair fields yet, so keeping this local avoids downstream ripple.
const actionsSchema = z.object({
  traits: z.array(featureSchema),
  actions: z.array(featureSchema),
  reactions: z.array(featureSchema),
  bonus_actions: z.array(featureSchema),

  has_lair: z.boolean(),
  lair_description: z.string(),
  lair_actions: z.array(featureSchema),

  is_legendary: z.boolean(),
  legendary_description: z.string(),
  legendary_actions: z.array(featureSchema),

  is_mythic: z.boolean(),
  mythic_description: z.string(),
  mythic_actions: z.array(featureSchema),
});

type ActionsValues = z.infer<typeof actionsSchema>;

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

const defaultActions: ActionsValues = {
  traits: [],
  actions: [],
  reactions: [],
  bonus_actions: [],

  has_lair: false,
  lair_description: "",
  lair_actions: [],

  is_legendary: false,
  legendary_description: "",
  legendary_actions: [],

  is_mythic: false,
  mythic_description: "",
  mythic_actions: [],
};

interface FeatureListProps {
  control: Control<ActionsValues>;
  name: FeatureArrayName;
  itemLabel: string;
  addLabel: string;
  title?: string;
  descriptionName?: DescriptionName;
  descriptionLabel?: string;
}

function FeatureList({
  control,
  name,
  itemLabel,
  addLabel,
  title,
  descriptionName,
  descriptionLabel,
}: FeatureListProps) {
  const { fields, append, remove, swap } = useFieldArray({ control, name });

  return (
    <FieldGroup className="gap-3">
      <div className="flex items-center justify-between gap-2">
        {title ? <FieldLabel className="mb-0">{title}</FieldLabel> : <span />}
        <Button
          type="button"
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
                      placeholder="ex. Multiattack"
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
                    <Textarea
                      {...field}
                      id={`form-rhf-${name}-${index}-description`}
                      placeholder="Describe the effect…"
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
  const form = useForm({
    resolver: zodResolver(actionsSchema),
    defaultValues: defaultActions,
  });
  const hasLair = form.watch("has_lair");
  const isLegendary = form.watch("is_legendary");
  const isMythic = form.watch("is_mythic");

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
      />
      <FeatureList
        control={form.control}
        name="actions"
        title="Actions"
        itemLabel="Action"
        addLabel="Add action"
      />
      <FeatureList
        control={form.control}
        name="reactions"
        title="Reactions"
        itemLabel="Reaction"
        addLabel="Add reaction"
      />
      <FeatureList
        control={form.control}
        name="bonus_actions"
        title="Bonus Actions"
        itemLabel="Bonus Action"
        addLabel="Add bonus action"
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
            descriptionName="lair_description"
            descriptionLabel="Lair Description"
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
            descriptionName="legendary_description"
            descriptionLabel="Legendary Description"
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
            descriptionName="mythic_description"
            descriptionLabel="Mythic Description"
          />
        )}
      </FieldGroup>
    </FieldSet>
  );
};
