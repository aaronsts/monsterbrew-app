"use client";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Info } from "lucide-react";
import { CollapsibleSection } from "../collapsible-section";
import { CrAbilityHint, CrStatHint } from "../cr-calculator/field-hint";
import type { Monster } from "@/schema/monster-schema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { ABILITY_SCORES } from "@/lib/abilities";
import { CHALLENGE_RATINGS } from "@/lib/constants";
import {
  blockMinusKey,
  calculateHitPoints,
  calculateStatBonus,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChallengeRating = Monster["cr"];

const MOVEMENTS = [
  { name: "movements.walk", label: "Walking" },
  { name: "movements.swim", label: "Swimming" },
  { name: "movements.burrow", label: "Burrowing" },
  { name: "movements.climb", label: "Climbing" },
  { name: "movements.fly", label: "Flying" },
] as const;

export const CombatForm = () => {
  const form = useFormContext<Monster>();
  const { control, getValues, setValue } = form;
  const [
    ability_scores,
    custom_hp,
    hit_dice,
    size,
    custom_initiative,
    custom_passive_perception,
  ] = useWatch({
    control,
    name: [
      "ability_scores",
      "custom_hp",
      "hit_dice",
      "size",
      "custom_initiative",
      "custom_passive_perception",
    ],
  });

  useEffect(() => {
    if (custom_hp) return;
    const next = calculateHitPoints(hit_dice, size, ability_scores?.con);
    if (next !== getValues("hit_points")) {
      setValue("hit_points", next);
    }
  }, [custom_hp, hit_dice, size, ability_scores?.con, setValue, getValues]);

  useEffect(() => {
    if (custom_initiative) return;
    const next = calculateStatBonus(ability_scores?.dex);
    if (next !== getValues("initiative_bonus")) {
      setValue("initiative_bonus", next);
    }
  }, [custom_initiative, ability_scores?.dex, setValue, getValues]);

  return (
    <CollapsibleSection
      id="combat"
      legend="Combat"
      description="Will decide how tough a creature is and how much damage it can deal"
    >
      {/* Challenge Rating & Initiative */}
      <FieldGroup className="grid grid-cols-2">
        <Controller
          name="cr"
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="col-span-2 md:col-span-1"
            >
              <FieldLabel htmlFor="form-rhf-input-cr">
                Challenge Rating
              </FieldLabel>
              <Combobox
                items={CHALLENGE_RATINGS}
                value={field.value}
                onValueChange={field.onChange}
                autoHighlight
                isItemEqualToValue={(
                  item: ChallengeRating,
                  value: ChallengeRating,
                ) => item.challenge_rating === value?.challenge_rating}
                itemToStringLabel={(rating: ChallengeRating) =>
                  `${rating.challenge_rating} (${new Intl.NumberFormat().format(
                    rating.experience,
                  )} XP)`
                }
              >
                <ComboboxInput
                  id="form-rhf-input-cr"
                  placeholder="Select a rating"
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ChallengeRating) => (
                      <ComboboxItem key={item.experience} value={item}>
                        <Item size="xs">
                          <ItemContent>
                            <ItemTitle>{item.challenge_rating}</ItemTitle>
                          </ItemContent>
                          <ItemMedia className="text-muted-foreground">
                            {new Intl.NumberFormat().format(item.experience)} XP
                          </ItemMedia>
                        </Item>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="initiative_bonus"
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="col-span-2 md:col-span-1"
            >
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="form-rhf-input-initiative-bonus">
                  Initiative
                </FieldLabel>
                <Controller
                  name="custom_initiative"
                  control={control}
                  render={({ field: customField }) => (
                    <Field
                      orientation="horizontal"
                      className="w-auto items-center"
                    >
                      <Switch
                        id="form-rhf-input-custom-initiative"
                        size="sm"
                        checked={customField.value ?? false}
                        onCheckedChange={customField.onChange}
                      />
                      <FieldLabel
                        htmlFor="form-rhf-input-custom-initiative"
                        className="text-xs font-normal text-muted-foreground"
                      >
                        <span aria-hidden>Manual</span>
                        <span className="sr-only">Manual initiative</span>
                      </FieldLabel>
                    </Field>
                  )}
                />
              </div>
              <Input
                {...field}
                value={field.value ?? 0}
                id="form-rhf-input-initiative-bonus"
                type="number"
                onFocus={(e) => e.target.select()}
                disabled={!custom_initiative}
                aria-invalid={fieldState.invalid}
                placeholder="ex. 2"
              />
              <FieldDescription>Bonus to initiative</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Ability Scores */}
      <FieldGroup className="grid grid-cols-3 xl:grid-cols-6">
        {ABILITY_SCORES.map((ability) => {
          const score = ability_scores[ability];
          const modifier =
            score !== undefined ? calculateStatBonus(score) : undefined;
          return (
            <Controller
              key={ability}
              name={`ability_scores.${ability}`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`form-rhf-input-${ability}`}>
                    {ability.toUpperCase()}{" "}
                    {modifier !== undefined && (
                      <span className="text-muted-foreground/60">
                        ({modifier >= 0 ? `+${modifier}` : modifier})
                      </span>
                    )}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`form-rhf-input-${ability}`}
                    type="number"
                    min={0}
                    onKeyDown={blockMinusKey}
                    onFocus={(e) => e.target.select()}
                    aria-invalid={fieldState.invalid}
                    placeholder="10"
                  />
                  <CrAbilityHint ability={ability} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          );
        })}
      </FieldGroup>

      {/* Passive Perception */}
      <FieldGroup className="grid grid-cols-2">
        <Controller
          name="passive_perception"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="col-span-2">
              <div className="flex items-center justify-between gap-2">
                {/* The tooltip trigger stays outside the label: a button
                    nested in the label would steal its association. */}
                <div className="flex items-center gap-1">
                  <FieldLabel htmlFor="form-rhf-input-passive-perception">
                    Passive Perception
                  </FieldLabel>
                  <TooltipProvider delay={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="text-primary-300 size-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        10 + WIS modifier, adds proficiency when Perception is
                        trained
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Controller
                  name="custom_passive_perception"
                  control={control}
                  render={({ field: customField }) => (
                    <Field
                      orientation="horizontal"
                      className="w-auto items-center"
                    >
                      <Switch
                        id="form-rhf-input-custom-passive-perception"
                        size="sm"
                        checked={customField.value}
                        onCheckedChange={customField.onChange}
                      />
                      <FieldLabel
                        htmlFor="form-rhf-input-custom-passive-perception"
                        className="text-xs font-normal text-muted-foreground"
                      >
                        <span aria-hidden>Manual</span>
                        <span className="sr-only">
                          Manual passive perception
                        </span>
                      </FieldLabel>
                    </Field>
                  )}
                />
              </div>
              <Input
                {...field}
                id="form-rhf-input-passive-perception"
                type="number"
                min={0}
                onKeyDown={blockMinusKey}
                onFocus={(e) => e.target.select()}
                disabled={!custom_passive_perception}
                aria-invalid={fieldState.invalid}
                placeholder="ex. 10"
              />
              <FieldDescription aria-hidden className="sr-only">
                10 + WIS modifier
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Armor Class */}
      <FieldGroup className="grid grid-cols-2">
        <Controller
          name="armor_class"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel htmlFor="form-rhf-input-armor-class">
                  Armor Class
                </FieldLabel>
                <CrStatHint stat="ac" />
              </div>
              <Input
                {...field}
                id="form-rhf-input-armor-class"
                type="number"
                min={0}
                onKeyDown={blockMinusKey}
                onFocus={(e) => e.target.select()}
                aria-invalid={fieldState.invalid}
                placeholder="ex. 15"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="armor_description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-armor-description">
                AC Description
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-armor-description"
                aria-invalid={fieldState.invalid}
                placeholder="ex. natural armor"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Hit Points */}
      <FieldGroup className="grid grid-cols-2">
        <Controller
          name="hit_points"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="form-rhf-input-hit-points">
                    Hit Points
                  </FieldLabel>
                  <CrStatHint stat="hp" />
                </div>
                <Controller
                  name="custom_hp"
                  control={control}
                  render={({ field: customField }) => (
                    <Field
                      orientation="horizontal"
                      className="w-auto items-center"
                    >
                      <Switch
                        id="form-rhf-input-custom-hp"
                        size="sm"
                        checked={customField.value}
                        onCheckedChange={customField.onChange}
                      />
                      <FieldLabel
                        htmlFor="form-rhf-input-custom-hp"
                        className="text-xs font-normal text-muted-foreground"
                      >
                        <span aria-hidden>Manual</span>
                        <span className="sr-only">Manual hit points</span>
                      </FieldLabel>
                    </Field>
                  )}
                />
              </div>
              <Input
                {...field}
                id="form-rhf-input-hit-points"
                disabled={!custom_hp}
                aria-invalid={fieldState.invalid}
                placeholder="ex. 195"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="hit_dice"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-hit-dice">
                Hit Dice
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-hit-dice"
                type="number"
                onKeyDown={blockMinusKey}
                onFocus={(e) => e.target.select()}
                aria-invalid={fieldState.invalid}
                placeholder="ex. 21"
              />
              <FieldDescription>Number of dice</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Speed */}
      <FieldGroup className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {MOVEMENTS.map((movement) => (
          <Controller
            key={movement.name}
            name={movement.name}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`form-rhf-input-${movement.name}`}>
                  {movement.label}{" "}
                  <span className="text-muted-foreground/60">(ft.)</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={`form-rhf-input-${movement.name}`}
                  type="number"
                  min={0}
                  step={5}
                  onKeyDown={blockMinusKey}
                  onFocus={(e) => e.target.select()}
                  aria-invalid={fieldState.invalid}
                  placeholder="ex. 0"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
        <Controller
          name="movements.hover"
          control={control}
          render={({ field }) => (
            <Field
              orientation="horizontal"
              className="items-center pt-2 xl:pb-2"
            >
              <Checkbox
                id="form-rhf-input-hover"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel
                htmlFor="form-rhf-input-hover"
                className="font-normal"
              >
                Can hover
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>
    </CollapsibleSection>
  );
};
