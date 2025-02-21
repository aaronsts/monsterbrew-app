import { Description } from "@/components/ui/description";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Movements() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();
  const movements: string[] = [];
  Object.entries(creature.movements).forEach((m) => {
    const hover = watch("movements.hover");
    if (!!m[1]) {
      switch (m[0]) {
        case "walk":
          movements.push(`${m[1]} ft.`);
          break;
        case "fly":
          return !!hover
            ? movements.push(`${m[0]} ${m[1]} ft. (hover)`)
            : movements.push(`${m[0]} ${m[1]} ft.`);
        case "hover":
          break;
        default:
          movements.push(`${m[0]} ${m[1]} ft.`);
          break;
      }
    }
  });
  return <Description title="Speed" description={movements.join(", ")} />;
}
