import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Traits() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  return (
    <div className="flex flex-col gap-3">
      <h3>Traits</h3>
      {creature.traits?.map((trait, i) => (
        <p key={trait.name + i}>
          <span className="italic font-bold">{trait.name}</span>{" "}
          {trait.description}
        </p>
      ))}
    </div>
  );
}
