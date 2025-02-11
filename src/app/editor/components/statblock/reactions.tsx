import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Reactions() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  const hasReactions = creature.reactions && creature.reactions?.length > 0;
  return (
    <div>
      {hasReactions && <h3 className="border-b border-black">Reactions</h3>}
      {creature.reactions?.map((action, i) => (
        <div key={action.name + i} className="flex gap-3">
          <h4 className="italic">{action.name}</h4>
          <p>{action.description}</p>
        </div>
      ))}
    </div>
  );
}
