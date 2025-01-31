import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Features() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  if (creature.features?.length === 0) {
    return (
      <div>
        <div className="flex gap-1">
          <h4 className="italic"> Amphibious.</h4>
          <p>The dragon can breathe air and water.</p>
        </div>
        <div>
          <h4 className="italic inline">Legendary Resistance (3/Day).</h4>{" "}
          <span>
            If the dragon fails a saving throw, it can choose to succeed
            instead.
          </span>
        </div>
      </div>
    );
  }
  return (
    <div>
      {creature.features?.map((feature, i) => (
        <div key={feature.name + i} className="flex gap-3">
          <h4 className="italic">{feature.name}</h4>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
