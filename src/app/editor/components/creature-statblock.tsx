import { Card, CardContent } from "@/components/ui/card";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Movements } from "./statblock/movements";
import { Divider } from "@/components/ui/divider";
import { AbilityScores } from "./statblock/ability-scores";
import { Traits } from "./statblock/traits";
import { CREATURE_SIZES } from "@/lib/constants";
import { Features } from "./statblock/features";
import { Actions } from "./statblock/actions";

function CreatureStatblock() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  const size = CREATURE_SIZES.find((s) => s.value === creature.size);
  const hpModifier = Math.floor(creature.ability_scores.con / 2) - 5;
  const extraHP = hpModifier * parseInt(creature.hit_dice);
  const hitPoints = `${creature.hit_dice || 21}d${size?.hit_dice || 20} + ${
    extraHP || 147
  }`;

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
              {creature.hit_points || "367"} ({hitPoints})
            </p>
          </div>
          <Movements />
        </div>
        <Divider />
        <AbilityScores />
        <Divider />
        <Traits />
        <Divider />
        <Features />
        <Actions />
      </CardContent>
    </Card>
  );
}

export default CreatureStatblock;
