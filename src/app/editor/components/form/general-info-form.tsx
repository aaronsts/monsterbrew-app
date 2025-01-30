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
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function GeneralInfoForm() {
  const [customHP, setCustomHP] = useState(false);

  const [selectedCR, setSelectedCR] = useState<
    (typeof CHALLENGE_RATINGS)[number] | undefined
  >(undefined);

  const form = useFormContext<z.infer<typeof createCreatureSchema>>();
  const challengeRating = form.watch("challenge_rating");

  useEffect(() => {
    const found = CHALLENGE_RATINGS.find(
      (r) => r.challenge_rating === challengeRating
    );
    setSelectedCR(found);
  }, [challengeRating]);
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
                <Input placeholder="Ancient Red Dragon" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="capitalize">
                  <SelectTrigger>
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
        {customHP ? (
          <FormField
            control={form.control}
            name="hit_dice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-2 items-center">
                  <TooltipProvider delayDuration={300}>
                    Custom HP
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 text-cararra-700" />
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
                  <Input placeholder="ex. 21d20 + 147" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="hit_dice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-2 items-center">
                  <TooltipProvider delayDuration={300}>
                    Hit Dice
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 text-cararra-700" />
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
          <span className="h-10 block"></span>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customHp"
              onCheckedChange={(e: boolean) => setCustomHP(e)}
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
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="challenge_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Rating</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="relative">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CHALLENGE_RATINGS.map((rating) => (
                    <SelectItem
                      key={rating.experience}
                      value={rating.challenge_rating.toString()}
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
          <span className="h-9 block"></span>
          <p>
            Proficiency Bonus:{" "}
            {selectedCR?.challenge_rating
              ? `+${selectedCR.proficiency_bonus}`
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
