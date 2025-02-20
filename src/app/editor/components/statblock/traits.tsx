import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Traits() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  if (creature.traits?.length === 0) {
    return (
      <div>
        <h3>Traits</h3>
        <div>
          <h4 className="italic inline">
            Legendary Resistance (4/Day, or 5/Day in Lair).
          </h4>{" "}
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
      <h3>Traits</h3>
      {creature.traits?.map((trait, i) => (
        <div key={trait.name + i} className="flex gap-3">
          <h4 className="italic">{trait.name}</h4>
          <p>{trait.description}</p>
        </div>
      ))}
    </div>
  );
}
