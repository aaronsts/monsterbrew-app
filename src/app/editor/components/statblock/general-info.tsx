import { Description } from "@/components/ui/description";
import { CREATURE_SIZES } from "@/lib/constants";
import { calculateStatBonus } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function BasicInfo() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  console.log(creature);

  function calculateHitPoints(amount: string, constitution?: number) {
    const size = CREATURE_SIZES.find((s) => creature.size === s.value);
    const hit_dice = size?.hit_dice || 4;
    const modifier = calculateStatBonus(constitution);
    const extraHP = modifier * parseInt(amount);
    const hp = parseInt(amount) + Math.floor(hit_dice * parseInt(amount));
    const medianHp = Math.floor(hp / 2 + extraHP);
    if (Number.isNaN(medianHp)) return "";
    return `${medianHp} (${amount}d${hit_dice} + ${extraHP})`;
  }

  const medianHP = calculateHitPoints(
    creature.hit_dice,
    creature.ability_scores.con
  );
  const hp = creature.custom_hp ? creature.hit_points : medianHP;

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

  return (
    <div>
      <div className="flex gap-1.5">
        <Description
          title="AC"
          description={creature.armor_class.toString()}
          placeholder="10"
        />
        <Description
          title="Initiative"
          description={`+${creature.cr.proficiency_bonus.toString()} (${
            creature.cr.proficiency_bonus + 10
          })`}
        />
      </div>
      <Description title="HP" description={hp} placeholder="15 (2d8 + 6)" />
      <Description
        title="Speed"
        description={movements.join(", ")}
        placeholder="30 ft."
      />
    </div>
  );
}
