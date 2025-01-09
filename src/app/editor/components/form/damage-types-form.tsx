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
import { LucideBookmarkMinus, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

function DamageTypesForm() {
  const [selectedDamageType, setSelectedDamageType] = useState<string>();
  const [immunities, setImmunities] = useState<string[]>([]);

  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const handleSelectChange = (value: string) => {
    setSelectedDamageType(value);
  };

  function addType(event: React.MouseEvent<HTMLElement>) {
    const damageType = event.currentTarget.dataset.damageType;
    if (!selectedDamageType) return;
    switch (damageType) {
      case "vulnerable":
        const damageExists = immunities.find(
          (dmg) => dmg === selectedDamageType
        );
        console.log(!!damageExists);

        break;

      default:
        break;
    }
    setImmunities((prevState) => [...prevState, selectedDamageType]);
  }

  function removeType(type: string, index: number) {
    const newArray = immunities.filter((_, i) => i !== index);
    setImmunities(newArray);
  }

  return (
    <div className="space-y-2">
      <Label>Damage types</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={addType}
            data-damage-type="vulnerable"
          >
            Vulnerable
          </Button>
          <Button
            type="button"
            variant="tertiary"
            onClick={addType}
            data-damage-type="resistant"
          >
            Resistant
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={addType}
            data-damage-type="immune"
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
        {immunities.map((bonus, i) => (
          <Badge
            className="relative pr-6"
            variant={bonus ? "proficient" : "expert"}
            key={bonus + i}
          >
            {bonus}
            <span
              className="absolute right-1.5 top-1 hover:cursor-pointer"
              data-skill={LucideBookmarkMinus}
              onClick={() => removeType("test", i)}
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
