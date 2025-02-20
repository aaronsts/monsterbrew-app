import { Card, CardContent } from "@/components/ui/card";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Movements } from "./statblock/movements";
import { AbilityScores } from "./statblock/ability-scores";
import { CHALLENGE_RATINGS, CREATURE_SIZES } from "@/lib/constants";
import { Actions } from "./statblock/actions";
import { Reactions } from "./statblock/reactions";
import { Traits } from "./statblock/traits";
import { Features } from "./statblock/features";

function CreatureStatblock() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  const size = CREATURE_SIZES.find((s) => s.value === creature.size);
  const hpModifier = Math.floor(creature.ability_scores.con / 2) - 5;
  const extraHP = hpModifier * parseInt(creature.hit_dice);
  const hitPoints = `${creature.hit_dice || 21}d${size?.hit_dice || 20} + ${
    extraHP || 147
  }`;

  const cr = CHALLENGE_RATINGS.find(
    (r) => r.challenge_rating === creature.challenge_rating
  );

  return (
    <Card>
      <CardContent className="pt-6 grid gap-1.5">
        <div className="grid gap-1.5">
          <h1 className="text-3xl font-bold small-caps border-b leading-normal">
            {watch("name") || "Ancient Red Dragon"}
          </h1>
          <p className="capitalize italic font-medium text-black/50">
            {creature.size || "Gargantuan"} {creature.type || "Dragon"},{" "}
            {creature.alignment || "Chaotic Evil"}
          </p>
        </div>
        <div className="flex gap-6">
          <div className="flex gap-1">
            <h4>AC</h4>
            <p>{creature.armor_class || "22"}</p>
          </div>
          <div className="flex gap-1">
            <h4>Initiative</h4>
            <p>+{cr?.proficiency_bonus || "14 (24)"}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <h4>HP </h4>
          <p>
            {creature.hit_points || "367"} ({hitPoints})
          </p>
        </div>
        <Movements />
        <AbilityScores />
        <Features />
        <Traits />
        <Actions />
        <Reactions />
      </CardContent>
    </Card>
  );
}

export default CreatureStatblock;
