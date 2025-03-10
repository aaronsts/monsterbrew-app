import { Card, CardContent } from "@/components/ui/card";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { AbilityScores } from "./statblock/ability-scores";
import { Actions } from "./statblock/actions";
import { Reactions } from "./statblock/reactions";
import { Traits } from "./statblock/traits";
import { Features } from "./statblock/features";
import { LegendaryActions } from "./statblock/legendary-actions";
import { BasicInfo } from "./statblock/basic-info";
import { RefObject } from "react";

function CreatureStatblock({ pdfRef }: { pdfRef: RefObject<HTMLDivElement> }) {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  return (
    <Card className="h-fit" ref={pdfRef}>
      <CardContent className="pt-6 grid gap-1.5">
        <h1 className="text-3xl font-bold small-caps border-b leading-normal">
          {creature.name || "Example Creature"}
        </h1>
        <BasicInfo />
        <AbilityScores />
        <Features />
        <div className="flex flex-col gap-6 my-3">
          <Traits />
          <Actions />
          <LegendaryActions />
        </div>
        <Reactions />
      </CardContent>
    </Card>
  );
}

export default CreatureStatblock;
