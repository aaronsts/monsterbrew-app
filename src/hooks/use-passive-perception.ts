import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { calculateStatBonus } from "@/lib/utils";

/**
 * Keeps `passive_perception` derived from WIS + perception proficiency
 * (10 + mod, plus PB or 2×PB for expertise) — unless
 * `custom_passive_perception` opts the field out of derivation.
 */
export function usePassivePerception(form: UseFormReturn<Monster>) {
  const { control, setValue } = form;
  const wis = useWatch({ control, name: "ability_scores.wis" });
  const skills = useWatch({ control, name: "skills" });
  const proficiencyBonus = useWatch({ control, name: "cr.proficiency_bonus" });
  const customPassivePerception = useWatch({
    control,
    name: "custom_passive_perception",
  });

  useEffect(() => {
    if (customPassivePerception) return;
    let perception = calculateStatBonus(wis);
    const perceptionProficiency = skills?.perception;
    if (perceptionProficiency) {
      const pb = proficiencyBonus ?? 0;
      perception += perceptionProficiency === "expert" ? pb * 2 : pb;
    }
    setValue("passive_perception", 10 + perception);
  }, [wis, skills, proficiencyBonus, customPassivePerception, setValue]);
}
