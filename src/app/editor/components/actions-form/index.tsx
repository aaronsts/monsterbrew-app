"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CollapsibleSection } from "../collapsible-section";
import { FeatureList } from "./feature-list";
import type { MarkupContext } from "@/lib/statblock-markup";
import type { Monster } from "@/schema/monster-schema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { getPresetsForType } from "@/lib/constants/actionPresets";

const TRAIT_PRESETS = getPresetsForType("trait");

export const ActionsForm = () => {
  const form = useFormContext<Monster>();
  const hasLair = useWatch({ control: form.control, name: "has_lair" });
  const isLegendary = useWatch({ control: form.control, name: "is_legendary" });
  const isMythic = useWatch({ control: form.control, name: "is_mythic" });

  const ability_scores = useWatch({
    control: form.control,
    name: "ability_scores",
  });
  const cr = useWatch({ control: form.control, name: "cr" });
  const name = useWatch({ control: form.control, name: "name" });
  const ctx: MarkupContext = { ability_scores, cr, name };

  return (
    <CollapsibleSection
      legend="Actions"
      description="What the creature can do in and out of combat"
    >
      <FeatureList
        control={form.control}
        name="traits"
        title="Traits"
        itemLabel="Trait"
        addLabel="Add trait"
        namePlaceholder="ex. Pack Tactics"
        descriptionPlaceholder="Describe the passive ability… e.g. The wolf has advantage on attack rolls against a creature if at least one ally is within 5 ft. of it."
        tags={[]}
        presets={TRAIT_PRESETS}
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
    </CollapsibleSection>
  );
};
