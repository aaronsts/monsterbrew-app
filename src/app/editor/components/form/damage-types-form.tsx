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
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function DamageTypesForm() {
  const [selectedDamageType, setSelectedDamageType] = useState<string>();
  const [damages, setDamages] = useState<{ name: string; type: string }[]>([]);
  const { setValue, getValues, watch } =
    useFormContext<z.infer<typeof createCreatureSchema>>();

  const addDamageType = (entry, arrayName) => {
    const otherArrays = [
      "damage_immunities",
      "damage_vulnerabilities",
      "damage_resistances",
    ].filter((name) => name !== arrayName);

    // Remove from other arrays
    otherArrays.forEach((otherArray) => {
      const current = getValues(otherArray) || [];
      console.log(entry, current);
      setValue(
        otherArray,
        current.filter((item) => item !== entry)
      );
    });

    const currentTarget = getValues(arrayName) || [];
    if (!currentTarget.some((item) => item === entry)) {
      setValue(arrayName, [...currentTarget, entry]);
    }
  };

  console.log(
    watch("damage_immunities"),
    watch("damage_vulnerabilities"),
    watch("damage_resistances")
  );

  const removeDamageType = useCallback((name: string) => {
    setDamages((prev) => prev.filter((item) => item.name !== name));
  }, []);

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
              bonus.type === "immune"
                ? "destructive"
                : bonus.type === "resistant"
                ? "proficient"
                : "expert"
            }
            key={bonus.name}
          >
            {bonus.name}
            <span
              className="absolute right-1.5 top-1 hover:cursor-pointer"
              onClick={() => removeDamageType(bonus.name)}
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
