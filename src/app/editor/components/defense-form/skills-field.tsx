import { Controller, useFormContext } from "react-hook-form";
import { CheckSquare } from "./check-square";
import {
  FOCUS_RING,
  SKILLS_BY_ABILITY,
  formatModifier,
  nextSkillState,
  setSkill,
} from "./helpers";
import type {
  SkillProficiency} from "./helpers";
import type { Monster } from "@/schema/monster-schema";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { calculateStatBonus, cn } from "@/lib/utils";

export function SkillsField() {
  const form = useFormContext<Monster>();
  const scores = form.watch("ability_scores");
  const profBonus = form.watch("cr.proficiency_bonus");

  return (
    <Controller
      name="skills"
      control={form.control}
      render={({ field }) => {
        const skillValues = field.value ?? {};
        return (
          <FieldGroup>
            <FieldLabel className="-mb-1">Skills</FieldLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SKILLS_BY_ABILITY.map(({ ability, label, skills }) => (
                <div key={ability} className="space-y-px">
                  <p className="pt-1.5 pb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  {skills.map(({ skill_name }) => {
                    const prof: SkillProficiency = skillValues[skill_name] ?? "";
                    const isProficient =
                      prof === "proficient" || prof === "expert";
                    const baseMod = calculateStatBonus(scores?.[ability]);
                    const totalMod =
                      prof === "expert"
                        ? baseMod + 2 * (profBonus || 0)
                        : prof === "proficient"
                          ? baseMod + (profBonus || 0)
                          : baseMod;
                    return (
                      <button
                        key={skill_name}
                        type="button"
                        aria-label={`${skill_name}: ${
                          isProficient ? prof : "not proficient"
                        }`}
                        onClick={() =>
                          field.onChange(
                            setSkill(
                              skillValues,
                              skill_name,
                              nextSkillState(prof),
                            ),
                          )
                        }
                        className={cn(
                          "flex w-full items-center  gap-2 px-2 py-1 text-left hover:bg-muted",
                          FOCUS_RING,
                        )}
                      >
                        <span className="flex gap-0.5">
                          <CheckSquare checked={isProficient} />
                          <CheckSquare checked={prof === "expert"} />
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-xs capitalize",
                            isProficient
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {skill_name}
                        </span>
                        <span
                          className={cn(
                            "text-[11px] tabular-nums",
                            isProficient
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatModifier(totalMod)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </FieldGroup>
        );
      }}
    />
  );
}
