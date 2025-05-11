import { Description } from "@/components/ui/description";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Traits() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  if (creature.traits.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="border-b border-carrara-600">Traits</h3>
      {creature.traits?.map((trait, i) => (
        <Description
          key={trait.name + i}
          title={trait.name}
          description={trait.description}
        />
      ))}
    </div>
  );
}
