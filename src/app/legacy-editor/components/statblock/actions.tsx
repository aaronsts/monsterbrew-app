import { useFormContext } from "react-hook-form";
import type { z } from "zod";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";
import { Description } from "@/components/ui/description";

export function Actions() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  if (creature.actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="border-b border-carrara-600">Actions</h3>
      {creature.actions?.map((action, i) => (
        <Description
          key={action.name + i}
          title={action.name}
          description={action.description}
        />
      ))}
    </div>
  );
}
