import { useFormContext, useWatch } from "react-hook-form";
import { AbilityScores } from "./statblock/ability-scores";
import { Actions } from "./statblock/actions";
import { Reactions } from "./statblock/reactions";
import { Traits } from "./statblock/traits";
import { Features } from "./statblock/features";
import { LegendaryActions } from "./statblock/legendary-actions";
import { BasicInfo } from "./statblock/general-info";
import { MythicActions } from "./statblock/mythic-actions";
import type { RefObject } from "react";
import type { z } from "zod";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";
import { Card, CardTitle } from "@/components/ui/card";

function CreatureStatblock({
  pdfRef,
}: {
  pdfRef: RefObject<HTMLDivElement | null>;
}) {
  const { control } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = useWatch({ control });

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
        {creature.is_legendary && <LegendaryActions />}
        {creature.is_mythic && <MythicActions />}
      </div>
    </Card>
  );
}

export default CreatureStatblock;
