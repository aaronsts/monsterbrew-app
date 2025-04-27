import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { DAMAGE_TYPES, Option } from "@/types/types";
import { X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

type DamageType =
  | "damage_immunities"
  | "damage_resistances"
  | "damage_vulnerabilities";

const arrays = [
  "damage_immunities",
  "damage_resistances",
  "damage_vulnerabilities",
] as DamageType[];

function DamageTypesForm() {
  const [selectedDamageTypes, setSelectedDamageTypes] = useState<Set<string>>(
    new Set()
  );
  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const damageTypes = DAMAGE_TYPES.map((lang) => ({
    label: titleCase(lang),
    value: lang.toLowerCase(),
  }));

  const addDamageType = (type: DamageType) => {
    if (selectedDamageTypes.size === 0) return;

    const otherArray = arrays.filter((name) => name !== type);

    // Process all selected damage types
    Array.from(selectedDamageTypes).forEach((dmg) => {
      // Remove from other arrays
      otherArray.forEach((otherArray) => {
        const current = form.getValues(otherArray) || [];
        form.setValue(
          otherArray,
          current.filter((item) => item !== dmg)
        );
      });

      // Add to target array
      const currentTarget = form.getValues(type) || [];
      if (!currentTarget.some((item) => item === dmg)) {
        form.setValue(type, [...currentTarget, dmg]);
      }
    });

    setSelectedDamageTypes(new Set());
  };

  // Combine all damage types for display
  const damages = [
    ...(form.watch("damage_immunities")?.map((i) => `${i}_immune`) || []),
    ...(form.watch("damage_resistances")?.map((i) => `${i}_resistant`) || []),
    ...(form.watch("damage_vulnerabilities")?.map((i) => `${i}_vulnerable`) ||
      []),
  ];

  const removeDamageType = (dmg: string) => {
    arrays.forEach((arrayName) => {
      const current = form.getValues(arrayName) || [];
      form.setValue(
        arrayName,
        current.filter((item) => item !== dmg)
      );
    });
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3">
        <div className="grid gap-2 flex-1">
          <Label>Damage type</Label>
          <MultiSelect
            title="Select skill"
            options={damageTypes}
            selectedValues={new Set(selectedDamageTypes)}
            onSelectionChange={(selectedValues) => {
              setSelectedDamageTypes(selectedValues);
            }}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 w-full">
          <Button
            type="button"
            variant="filled"
            color="destructive"
            onClick={() => addDamageType("damage_vulnerabilities")}
          >
            Vulnerable
          </Button>
          <Button
            type="button"
            className="bg-resistant text-carrara-50 shadow-xs hover:bg-resistant/90"
            onClick={() => addDamageType("damage_resistances")}
          >
            Resistant
          </Button>
          <Button
            type="button"
            className="bg-immune text-carrara-50 shadow-xs hover:bg-immune/90"
            onClick={() => addDamageType("damage_immunities")}
          >
            Immune
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {damages.map((bonus) => {
          const [type, category] = bonus.split("_");
          return (
            <Badge
              className="relative pr-6 capitalize"
              variant={
                category === "immune"
                  ? "immune"
                  : category === "resistant"
                  ? "resistant"
                  : "destructive"
              }
              key={bonus}
            >
              {type}
              <span
                className="absolute right-1.5 top-1 hover:cursor-pointer"
                onClick={() => removeDamageType(type)}
              >
                <X className="w-3 h-3" />
              </span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export default DamageTypesForm;
