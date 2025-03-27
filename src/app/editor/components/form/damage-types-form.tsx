import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { DAMAGE_TYPES } from "@/types/types";
import { X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

type DamageType =
  | "damage_immunities"
  | "damage_resistances"
  | "damage_vulnerabilities";

function DamageTypesForm() {
  const [selectedDamageType, setSelectedDamageType] = useState<string>();
  const { setValue, getValues, watch } =
    useFormContext<z.infer<typeof createCreatureSchema>>();

  const addDamageType = (dmg: string | undefined, type: DamageType) => {
    if (!dmg) return;
    const otherArrays = [
      "damage_immunities",
      "damage_vulnerabilities",
      "damage_resistances",
    ].filter((name) => name !== type) as DamageType[];

    // Remove from other arrays
    otherArrays.forEach((otherArray) => {
      const current = getValues(otherArray) || [];
      setValue(
        otherArray,
        current.filter((item) => item !== dmg)
      );
    });

    const currentTarget = getValues(type) || [];
    if (!currentTarget.some((item) => item === dmg)) {
      setValue(type, [...currentTarget, dmg]);
    }
  };

  const damages = [
    ...(watch("damage_immunities")?.map((i) => `${i}_immune`) as string[]),
    ...(watch("damage_resistances")?.map((i) => `${i}_resistant`) as string[]),
    ...(watch("damage_vulnerabilities")?.map(
      (i) => `${i}_vulnerable`
    ) as string[]),
  ];

  const removeDamageType = (dmg: string) => {
    const arrays = [
      "damage_immunities",
      "damage_resistances",
      "damage_vulnerabilities",
    ] as DamageType[];
    arrays.forEach((arrayName) => {
      const current = getValues(arrayName) || [];
      setValue(
        arrayName,
        current.filter((item) => item !== dmg)
      );
    });
  };

  const handleSelectChange = (value: string) => {
    setSelectedDamageType(value);
  };

  return (
    <div className="space-y-2">
      <Label>Damage types</Label>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="grid xl:grid-cols-3 gap-3 w-full">
          <Button
            type="button"
            variant="destructive"
            onClick={() =>
              addDamageType(selectedDamageType, "damage_vulnerabilities")
            }
          >
            Vulnerable
          </Button>
          <Button
            type="button"
            className="bg-resistant text-white shadow-xs hover:bg-resistant/90 focus-visible:ring-resistant/80 dark:focus-visible:ring-resistant/40"
            onClick={() =>
              addDamageType(selectedDamageType, "damage_resistances")
            }
          >
            Resistant
          </Button>
          <Button
            type="button"
            className="bg-immune text-white shadow-xs hover:bg-immune/90 focus-visible:ring-immune/80 dark:focus-visible:ring-immune/40"
            onClick={() =>
              addDamageType(selectedDamageType, "damage_immunities")
            }
          >
            Immune
          </Button>
        </div>
        <div className="ml-auto">
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full capitalize">
              <SelectValue placeholder="Select a damage type" />
            </SelectTrigger>
            <SelectContent>
              {DAMAGE_TYPES.map((type) => (
                <div key={type}>
                  <SelectItem value={type} className="relative capitalize">
                    {titleCase(type)}
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 py-3">
        {damages.map((bonus) => (
          <Badge
            className="relative pr-6 capitalize"
            variant={
              bonus?.includes("immune")
                ? "immune"
                : bonus?.includes("resistant")
                ? "resistant"
                : "destructive"
            }
            key={bonus}
          >
            {bonus.split("_")[0]}
            <span
              className="absolute right-1.5 top-1 hover:cursor-pointer"
              onClick={() => removeDamageType(bonus.split("_")[0])}
            >
              <X className="w-3 h-3" />
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default DamageTypesForm;
