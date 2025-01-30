import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Features() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  console.log(creature.actions);
  return (
    <div>
      {creature.actions?.map((action, i) => (
        <div key={action.name + i} className="flex gap-3">
          <h4 className="italic">{action.name}</h4>
          <p>{action.description}</p>
        </div>
      ))}
    </div>
  );
}
