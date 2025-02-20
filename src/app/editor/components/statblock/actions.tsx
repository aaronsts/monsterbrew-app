import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Actions() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  const hasActions = creature.actions && creature.actions?.length > 0;

  if (!hasActions) {
    return (
      <div>
        <h3>Actions</h3>
        <div className="grid gap-2 ">
          <div>
            <h4 className="italic inline">Multiattack.</h4>{" "}
            <span>
              The dragon makes three Rend attacks. It can replace one attack
              with a use of Spellcasting to cast Scorching Ray (level 3
              version).
            </span>
          </div>
          <div>
            <h4 className="italic inline">Rend.</h4>{" "}
            <span>
              Melee Attack Roll: +17, reach 15 ft. Hit: 19 (2d8 + 10) Slashing
              damage plus 10 (3d6) Fire damage.
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h3>Actions</h3>
      {creature.actions?.map((action, i) => (
        <div key={action.name + i} className="flex gap-3">
          <h4 className="italic">{action.name}</h4>
          <p>{action.description}</p>
        </div>
      ))}
    </div>
  );
}
