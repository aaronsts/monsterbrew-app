import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CHALLENGE_RATINGS,
  CREATURE_SIZES,
  CREATURE_TYPES,
} from "@/lib/constants";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { Info } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import AbilityScoresForm from "./ability-scores-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type ChallengeRating = z.infer<typeof createCreatureSchema>["cr"];

export function GeneralInfoForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();
  const cr = form.watch("cr");
  const customHP = form.watch("custom_hp");

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="col-span-3 lg:col-span-2">
            <FormLabel>Creature Name</FormLabel>
            <FormControl>
              <Input placeholder="ex. Ancient Red Dragon" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Creature Type</FormLabel>
            <FormControl>
              <Combobox
                items={CREATURE_TYPES}
                inputValue={field.value}
                itemToStringValue={(size: (typeof CREATURE_TYPES)[number]) =>
                  size.label
                }
                onInputValueChange={field.onChange}
              >
                <ComboboxInput placeholder="Select a type" showClear />
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
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creature Size</FormLabel>
              <FormControl>
                <Combobox
                  items={CREATURE_SIZES}
                  inputValue={field.value}
                  itemToStringValue={(size: (typeof CREATURE_SIZES)[number]) =>
                    size.label
                  }
                  onInputValueChange={field.onChange}
                >
                  <ComboboxInput placeholder="Select a size" showClear />
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alignment</FormLabel>
              <FormControl>
                <Input placeholder="ex. Chaotic Evil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="armor_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Armor Class (AC)</FormLabel>
              <FormControl>
                <Input placeholder="ex. 21" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="armor_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AC Description</FormLabel>
              <FormControl>
                <Input placeholder="ex. Natural Armor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {customHP && (
          <FormField
            control={form.control}
            name="hit_points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hit Points</FormLabel>
                <FormControl>
                  <Input placeholder="ex. 507 (21d20 + 147)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!customHP && (
          <FormField
            control={form.control}
            name="hit_dice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="relative">
                  <TooltipProvider delay={200}>
                    Hit Dice
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="absolute left-15 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Hit Dice is based <br /> on a creatures&apos; <br />{" "}
                          Size and Constitution
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input placeholder="ex. 21" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="space-y-0.5">
          <span className="h-7 hidden lg:block"></span>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customHp"
              checked={form.watch("custom_hp")}
              onCheckedChange={(e: boolean) => {
                form.setValue("custom_hp", e);
              }}
            />
            <Label
              htmlFor="customHp"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Custom HP
            </Label>
          </div>
        </div>
      </div>
      <AbilityScoresForm />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="cr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Rating</FormLabel>
              <FormControl>
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
                  <ComboboxInput placeholder="Select a rating" showClear />
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
                              {new Intl.NumberFormat().format(item.experience)}{" "}
                              XP
                            </ItemMedia>
                          </Item>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-0.5 col-span-2">
          <span className="h-7 hidden lg:block"></span>
          <p>Proficiency Bonus: +{cr.proficiency_bonus}</p>
        </div>
      </div>
    </div>
  );
}
