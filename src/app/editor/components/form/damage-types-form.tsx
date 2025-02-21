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
      <div className="grid grid-cols-2 gap-3">
        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              addDamageType(selectedDamageType, "damage_vulnerabilities")
            }
          >
            Vulnerable
          </Button>
          <Button
            type="button"
            variant="tertiary"
            onClick={() =>
              addDamageType(selectedDamageType, "damage_resistances")
            }
          >
            Resistant
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() =>
              addDamageType(selectedDamageType, "damage_immunities")
            }
          >
            Immune
          </Button>
        </div>
        <div className="">
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="relative capitalize">
              <SelectValue placeholder="Select a skill" />
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
            className="relative pr-6"
            variant={
              bonus?.includes("immune")
                ? "destructive"
                : bonus?.includes("resistant")
                ? "proficient"
                : "expert"
            }
            key={bonus}
          >
            {bonus}
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
