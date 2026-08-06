"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { calculateStatBonus } from "@/lib/utils";

/**
 * Headless host for the editor's derived values — currently just passive
 * perception, which stays derived from WIS + perception proficiency
 * (10 + mod, plus PB or 2×PB for expertise) unless `custom_passive_perception`
 * opts the field out.
 *
 * It renders nothing on purpose. Watching form fields re-renders whatever
 * component does the watching, and mounted in `MonsterForm` that meant every
 * WIS or skill edit re-rendered the whole editor: `MonsterForm` renders the
 * `FormProvider`, whose context value is rebuilt each render, so every section
 * form re-renders with it and `React.memo` can't intervene (#158). Down here
 * the re-render costs nothing, because there is nothing to render.
 */
export function DerivedValues() {
  const { control, setValue } = useFormContext<Monster>();
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

  return null;
}
