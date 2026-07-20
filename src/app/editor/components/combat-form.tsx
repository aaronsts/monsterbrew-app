"use client";
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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { CHALLENGE_RATINGS } from "@/lib/constants";
import { calculateHitPoints, calculateStatBonus } from "@/lib/utils";
import { abilityScoresSchema, Monster } from "@/schema/monster-schema";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

type ChallengeRating = Monster["cr"];

const ABILITY_SCORES = abilityScoresSchema.keyof()._def.values;

const MOVEMENTS = [
  { name: "movements.walk", label: "Walking" },
  { name: "movements.swim", label: "Swimming" },
  { name: "movements.burrow", label: "Burrowing" },
  { name: "movements.climb", label: "Climbing" },
  { name: "movements.fly", label: "Flying" },
] as const;

export const CombatForm = () => {
  const form = useFormContext<Monster>();
  const abilityScoreValues = form.watch("ability_scores");
  const customHp = form.watch("custom_hp");
  const hitDice = form.watch("hit_dice");
  const size = form.watch("size");

  // Keep the derived HP in sync while not overriding. When "Set HP manually" is
  // on, the user owns `hit_points`; otherwise it's derived from hit dice + size
  // + CON so the stored record matches the statblock.
  useEffect(() => {
    if (customHp) return;
    form.setValue("hit_points", calculateHitPoints(hitDice, size, abilityScoreValues?.con));
  }, [customHp, hitDice, size, abilityScoreValues?.con, form]);

  return (
    <FieldSet>
      <FieldLegend>Combat</FieldLegend>
      <FieldDescription>
        Will decide how though a creature is and how much damage it can deal
      </FieldDescription>

      {/* Challenge Rating */}
      <FieldGroup>
        <Controller
          name="cr"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-cr">
                Challenge Rating
              </FieldLabel>
              <Combobox
                items={CHALLENGE_RATINGS}
                value={field.value}
                onValueChange={field.onChange}
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
      </FieldGroup>

      {/* Armor Class */}
      <FieldGroup className="grid grid-cols-2">
        <Controller
          name="armor_class"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-armor-class">
                Armor Class
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-armor-class"
                type="number"
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
          control={form.control}
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
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="form-rhf-input-hit-points">
                  Hit Points
                </FieldLabel>
                <Controller
                  name="custom_hp"
                  control={form.control}
                  render={({ field: customField }) => (
                    <Field orientation="horizontal" className="w-auto items-center">
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
                        Manual
                      </FieldLabel>
                    </Field>
                  )}
                />
              </div>
              <Input
                {...field}
                id="form-rhf-input-hit-points"
                disabled={!customHp}
                aria-invalid={fieldState.invalid}
                placeholder="ex. 195"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="hit_dice"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-hit-dice">
                Hit Dice
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-hit-dice"
                aria-invalid={fieldState.invalid}
                placeholder="ex. 21"
              />
              <FieldDescription>
                Number of dice; size sets the die, CON the bonus
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Ability Scores */}
      <FieldGroup className="grid grid-cols-3 xl:grid-cols-6">
        {ABILITY_SCORES.map((ability) => {
          const score = abilityScoreValues?.[ability];
          const modifier =
            score !== undefined ? calculateStatBonus(score) : undefined;
          return (
            <Controller
              key={ability}
              name={`ability_scores.${ability}`}
              control={form.control}
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
                    onFocus={(e) => e.target.select()}
                    aria-invalid={fieldState.invalid}
                    placeholder="10"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          );
        })}
      </FieldGroup>

      {/* Speed */}
      <FieldGroup className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {MOVEMENTS.map((movement) => (
          <Controller
            key={movement.name}
            name={movement.name}
            control={form.control}
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
                  onFocus={(e) => e.target.select()}
                  aria-invalid={fieldState.invalid}
                  placeholder="ex. 0"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}
        <Controller
          name="movements.hover"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center xl:pb-2">
              <Checkbox
                id="form-rhf-input-hover"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="form-rhf-input-hover" className="font-normal">
                Can hover
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
};
