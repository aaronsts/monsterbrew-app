import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Movements } from "./statblock/movements";
import { Divider } from "@/components/ui/divider";

function CreatureStatblock() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div>
          <h1 className="text-3xl leading-none font-bold small-caps">
            {watch("name") || "Ancient Red Dragon"}
          </h1>
          <p className="capitalize text-sm italic">
            {creature.size || "Gargantuan"} {creature.type || "Dragon"},{" "}
            {creature.alignment || "Chaotic Evil"}
          </p>
        </div>
        <Divider />
        <div>
          <div className="flex gap-2">
            <h4>Armor Class </h4>
            <p>
              {creature.armor_class || "22"} (
              {creature.armor_description || "natural armor"})
            </p>
          </div>
          <div className="flex gap-2">
            <h4>Hit points </h4>
            <p>
              {creature.hit_points || "367"} (
              {creature.armor_description || "21d20 + 147"})
            </p>
          </div>
          <Movements />
        </div>
        <Divider />
      </CardContent>
    </Card>
  );
}

export default CreatureStatblock;
