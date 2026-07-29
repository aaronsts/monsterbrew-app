"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { CollapsibleSection } from "../collapsible-section";
import type { Monster } from "@/schema/monster-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { CREATURE_SIZES, CREATURE_TYPES } from "@/lib/constants";
import { blockMinusKey, titleCase } from "@/lib/utils";
import { Languages } from "@/schema/createCreatureSchema";

const SENSES = [
  { name: "senses.blindsight", label: "Blindsight" },
  { name: "senses.darkvision", label: "Darkvision" },
  { name: "senses.tremorsense", label: "Tremorsense" },
  { name: "senses.truesight", label: "Truesight" },
] as const;

const LANGUAGES = Object.values(Languages);

export const IdentityForm = () => {
  const { control } = useFormContext<Monster>();
  const [customLanguageInput, setCustomLanguageInput] = useState("");
  return (
    <CollapsibleSection
      legend="Identity"
      description="General information about the creature"
    >
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-input-name">Name</FieldLabel>
            <Input
              {...field}
              id="form-rhf-input-name"
              aria-invalid={fieldState.invalid}
              placeholder="ex. Ancient Red Dragon"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FieldGroup className="grid grid-cols-2">
        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-type">Type</FieldLabel>
              <Combobox
                items={CREATURE_TYPES}
                inputValue={field.value}
                itemToStringValue={(size: (typeof CREATURE_TYPES)[number]) =>
                  size.label
                }
                onInputValueChange={field.onChange}
                autoHighlight
              >
                <ComboboxInput
                  id="form-rhf-input-type"
                  placeholder="Select a type"
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: (typeof CREATURE_TYPES)[number]) => (
                      <ComboboxItem key={item.value} value={item.value}>
                        <Item size="sm">
                          <ItemContent>
                            <ItemTitle>{item.label}</ItemTitle>
                            <ItemDescription>
                              {item.description}
                            </ItemDescription>
                          </ItemContent>
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
          name="size"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-size">Size</FieldLabel>
              <Combobox
                items={CREATURE_SIZES}
                inputValue={field.value}
                itemToStringValue={(size: (typeof CREATURE_SIZES)[number]) =>
                  size.label
                }
                onInputValueChange={field.onChange}
                autoHighlight
              >
                <ComboboxInput
                  id="form-rhf-input-size"
                  placeholder="Select a size"
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: (typeof CREATURE_SIZES)[number]) => (
                      <ComboboxItem key={item.value} value={item.value}>
                        <Item size="xs">
                          <ItemMedia>d{item.hit_dice}</ItemMedia>
                          <ItemContent>
                            <ItemTitle>{item.label}</ItemTitle>
                          </ItemContent>
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
          name="sub_type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-sub-type">Subtype</FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-sub-type"
                aria-invalid={fieldState.invalid}
                placeholder="ex. Chromatic"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="alignment"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-alignment">
                Alignment
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-alignment"
                aria-invalid={fieldState.invalid}
                placeholder="ex. Chaotic Evil"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Senses */}
      <FieldGroup>
        <FieldLabel className="-mb-1">Senses</FieldLabel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SENSES.map((sense) => (
            <Controller
              key={sense.name}
              name={sense.name}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`form-rhf-input-${sense.name}`}>
                    {sense.label}{" "}
                    <span className="text-muted-foreground/60">(ft.)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`form-rhf-input-${sense.name}`}
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
            name="senses.is_blind_beyond"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal" className="items-center md:pb-2">
                <Checkbox
                  id="form-rhf-input-is-blind-beyond"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel
                  htmlFor="form-rhf-input-is-blind-beyond"
                  className="font-normal"
                >
                  Blind beyond
                </FieldLabel>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      {/* Languages */}
      <Controller
        name="languages"
        control={control}
        render={({ field }) => {
          const selected = field.value ?? [];
          return (
            <FieldGroup>
              <FieldLabel className="-mb-1">Languages</FieldLabel>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 xl:grid-cols-5">
                {LANGUAGES.map((language) => {
                  const active = selected.includes(language);
                  const id = `form-rhf-language-${language}`;
                  return (
                    <Field
                      key={language}
                      orientation="horizontal"
                      className="w-auto items-center"
                    >
                      <Checkbox
                        id={id}
                        checked={active}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...selected, language]
                              : selected.filter((l) => l !== language),
                          )
                        }
                      />
                      <FieldLabel htmlFor={id} className="font-normal">
                        {titleCase(language)}
                      </FieldLabel>
                    </Field>
                  );
                })}
              </div>
            </FieldGroup>
          );
        }}
      />

      {/* Custom languages */}
      <Controller
        name="custom_languages"
        control={control}
        render={({ field }) => {
          const custom = field.value ?? [];
          const addCustomLanguage = () => {
            const value = customLanguageInput.trim();
            if (!value || custom.includes(value)) {
              setCustomLanguageInput("");
              return;
            }
            field.onChange([...custom, value]);
            setCustomLanguageInput("");
          };
          return (
            <FieldGroup>
              <FieldLabel
                htmlFor="form-rhf-input-custom-language"
                className="-mb-1"
              >
                Custom languages
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="form-rhf-input-custom-language"
                  value={customLanguageInput}
                  onChange={(e) => setCustomLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomLanguage();
                    }
                  }}
                  placeholder="ex. telepathy"
                />
                <Button
                  type="button"
                  color="neutral"
                  variant="outline"
                  onClick={addCustomLanguage}
                  disabled={!customLanguageInput.trim()}
                >
                  Add
                </Button>
              </div>
              {custom.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {custom.map((language) => (
                    <Badge key={language} variant="secondary">
                      {language}
                      <Button
                        color="neutral"
                        variant="transparent"
                        size="icon-xs"
                        type="button"
                        aria-label={`Remove ${language}`}
                        onClick={() =>
                          field.onChange(custom.filter((l) => l !== language))
                        }
                        className="-mr-2 hover:text-destructive "
                      >
                        <X />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </FieldGroup>
          );
        }}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="form-rhf-input-description">
              Description
            </FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              id="form-rhf-input-description"
              placeholder="ex. Kobolds are small reptilian humanoids that dwell in dark places…"
            />
            <FieldDescription>
              Flavor text shown at the bottom of the statblock
            </FieldDescription>
          </Field>
        )}
      />
    </CollapsibleSection>
  );
};
