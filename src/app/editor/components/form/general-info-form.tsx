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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function GeneralInfoForm() {
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();
  const cr = form.watch("cr");
  const customHP = form.watch("custom_hp");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-2">
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CREATURE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creature Size</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl className="capitalize">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CREATURE_SIZES.map((size) => (
                    <SelectItem
                      key={size.id}
                      className="capitalize"
                      value={size.value}
                    >
                      {size.label} -{" "}
                      <span className="text-muted-foreground">
                        D{size.hit_dice}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <TooltipProvider delayDuration={300}>
                    Hit Dice
                    <Tooltip>
                      <TooltipTrigger asChild>
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
          <span className="h-7 block"></span>
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
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="cr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Rating</FormLabel>
              <Select
                value={JSON.stringify(field.value)}
                onValueChange={(v) => field.onChange(JSON.parse(v))}
              >
                <FormControl className="relative">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CHALLENGE_RATINGS.map((rating) => (
                    <SelectItem
                      key={rating.experience}
                      value={JSON.stringify(rating)}
                      className="justify-between"
                    >
                      {rating.challenge_rating}
                      <span className="absolute right-8 text-primary">
                        {new Intl.NumberFormat().format(rating.experience)} XP
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-0.5 col-span-2">
          <span className="h-7 block"></span>
          <p>Proficiency Bonus: +{cr.proficiency_bonus}</p>
        </div>
      </div>
    </div>
  );
}
