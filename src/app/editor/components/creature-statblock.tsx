import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { AbilityScores } from "./statblock/ability-scores";
import { Actions } from "./statblock/actions";
import { Reactions } from "./statblock/reactions";
import { Traits } from "./statblock/traits";
import { Features } from "./statblock/features";
import { LegendaryActions } from "./statblock/legendary-actions";
import { BasicInfo } from "./statblock/general-info";
import { RefObject } from "react";

function CreatureStatblock({
  pdfRef,
}: {
  pdfRef: RefObject<HTMLDivElement | null>;
}) {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  return (
    <Card className="h-fit" ref={pdfRef}>
      <div>
        <CardTitle>{creature.name || "Example Creature"}</CardTitle>
        <p className="capitalize italic font-medium text-black/50">
          {creature.size || "Size"} {creature.type || "Type"},{" "}
          {creature.alignment || "Alignment"}
        </p>
      </div>
      <BasicInfo />
      <AbilityScores />
      <Features />
      <div className="flex flex-col gap-6 my-3">
        <Traits />
        <Actions />
        <Reactions />
        <LegendaryActions />
      </div>
    </Card>
  );
}

export default CreatureStatblock;
