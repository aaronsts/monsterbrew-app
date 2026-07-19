"use client";
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
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item";
import { CREATURE_SIZES, CREATURE_TYPES } from "@/lib/constants";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

export const IdentityForm = () => {
  const form = useForm({ resolver: zodResolver(createCreatureSchema) });
  return (
    <FieldSet>
      <FieldLegend>Identity</FieldLegend>
      <FieldDescription>
        General information about the creature
      </FieldDescription>

      <Controller
        name="name"
        control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-sub-type">Subtype</FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-sub-type"
                aria-invalid={fieldState.invalid}
                placeholder="ex. Chaotic Evil"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="alignment"
          control={form.control}
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
    </FieldSet>
  );
};
