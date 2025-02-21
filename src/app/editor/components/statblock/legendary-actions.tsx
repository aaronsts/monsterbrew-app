import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function LegendaryActions() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  return (
    <div className="flex flex-col gap-3">
      <h3>Legendary Actions</h3>
      <p className="italic">{creature.legendary_description}</p>
      {creature.legendary_actions?.map((action, i) => (
        <p key={action.name + i}>
          <span className="italic font-bold">{action.name}</span>{" "}
          {action.description}
        </p>
      ))}
    </div>
  );
}
