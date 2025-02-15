import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Actions() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  const hasActions = creature.actions && creature.actions?.length > 0;
  return (
    <div>
      {hasActions && <h3 className="border-b border-black">Actions</h3>}
      {creature.actions?.map((action, i) => (
        <div key={action.name + i} className="flex gap-3">
          <h4 className="italic">{action.name}</h4>
          <p>{action.description}</p>
        </div>
      ))}
    </div>
  );
}
