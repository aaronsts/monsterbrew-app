"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SKILLS } from "@/lib/skills";
import { calculateStatBonus, cn } from "@/lib/utils";
import { abilityScoresSchema, Monster } from "@/schema/monster-schema";
import { CONDITIONS, DAMAGE_TYPES } from "@/types/types";
import { Check, Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

type AbilityKey = keyof z.infer<typeof abilityScoresSchema>;
const ABILITY_SCORES = abilityScoresSchema.keyof()._def.values as AbilityKey[];

type SkillProficiency = "proficient" | "expert" | "";
type DamageState = "resistant" | "vulnerable" | "immune" | "";

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

const SKILLS_BY_ABILITY = ABILITY_SCORES.map((ability) => ({
  ability,
  label: ABILITY_LABELS[ability],
  skills: SKILLS.filter((skill) => skill.skill_modifier === ability),
})).filter((group) => group.skills.length > 0);

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function nextSkillState(state: SkillProficiency): SkillProficiency {
  return state === "" ? "proficient" : state === "proficient" ? "expert" : "";
}

function nextDamageState(state: DamageState): DamageState {
  return state === ""
    ? "resistant"
    : state === "resistant"
      ? "vulnerable"
      : state === "vulnerable"
        ? "immune"
        : "";
}

function setSkill(
  current: NonNullable<Monster["skills"]>,
  name: string,
  next: SkillProficiency,
): Monster["skills"] {
  const updated = { ...current };
  if (next === "") {
    delete updated[name];
  } else {
    updated[name] = next;
  }
  return updated;
}

function setDamage(
  current: NonNullable<Monster["damage_modifiers"]>,
  name: string,
  next: DamageState,
): Monster["damage_modifiers"] {
  const updated = { ...current };
  if (next === "") {
    delete updated[name];
  } else {
    updated[name] = next;
  }
  return updated;
}

function damageStateStyles(state: DamageState): string {
  switch (state) {
    case "vulnerable":
      return "border-red-400/50 bg-red-400/10 text-red-400 hover:bg-red-400/20 hover:text-red-400";
    case "resistant":
      return "border-amber-400/50 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 hover:text-amber-400";
    case "immune":
      return "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500";
    default:
      return "border-input text-muted-foreground hover:bg-muted";
  }
}

// Our custom focus-visible treatment, matching the Button component.
const FOCUS_RING =
  "outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 items-center justify-center rounded-none border border-input transition-colors",
        checked && "border-primary bg-primary text-primary-foreground",
      )}
    >
      {checked && <Check className="size-3.5" />}
    </span>
  );
}

export const DefenseForm = () => {
  const form = useFormContext<Monster>();

  const scores = form.watch("ability_scores");
  const profBonus = form.watch("cr.proficiency_bonus");

  return (
    <TooltipProvider>
      <FieldSet>
        <FieldLegend>Defense</FieldLegend>
        <FieldDescription>
          How resilient a creature is against attacks and effects
        </FieldDescription>

        {/* Saving Throws */}
        <FieldGroup>
          <FieldLabel className="-mb-1">Saving Throws</FieldLabel>
          <div className="grid grid-cols-3 gap-1 xl:grid-cols-6">
            {ABILITY_SCORES.map((ability) => (
              <Controller
                key={ability}
                name={`saving_throws.${ability}`}
                control={form.control}
                render={({ field }) => {
                  const baseMod = calculateStatBonus(scores?.[ability]);
                  const total = field.value
                    ? baseMod + (profBonus || 0)
                    : baseMod;
                  return (
                    <Field
                      orientation="horizontal"
                      className="items-center px-2 py-1.5 hover:bg-muted"
                    >
                      <Checkbox
                        id={`form-rhf-save-${ability}`}
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FieldLabel
                        htmlFor={`form-rhf-save-${ability}`}
                        className={cn(
                          "flex-1 cursor-pointer font-normal uppercase",
                          field.value
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {ability}
                      </FieldLabel>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          field.value
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatModifier(total)}
                      </span>
                    </Field>
                  );
                }}
              />
            ))}
          </div>
        </FieldGroup>

        {/* Skills */}
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
                        const prof: SkillProficiency =
                          skillValues[skill_name] ?? "";
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

        {/* Damage Modifiers */}
        <Controller
          name="damage_modifiers"
          control={form.control}
          render={({ field }) => {
            const states = field.value ?? {};
            return (
              <FieldGroup>
                <span className="inline-flex items-center gap-1.5">
                  <FieldLabel>Damage Modifiers</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Info className="size-3" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="flex max-w-xs flex-col items-start space-y-1 p-3 text-left"
                    >
                      <p className="font-bold">
                        Click a damage type to cycle its state:
                      </p>
                      <ul className="space-y-0.5">
                        <li>
                          <span className="font-semibold text-red-400">
                            Red
                          </span>{" "}
                          — Vulnerable (double damage)
                        </li>
                        <li>
                          <span className="font-semibold text-amber-400">
                            Amber
                          </span>{" "}
                          — Resistant (half damage)
                        </li>
                        <li>
                          <span className="font-semibold text-green-500">
                            Green
                          </span>{" "}
                          — Immune (no damage)
                        </li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <div className="flex flex-wrap gap-1">
                  {DAMAGE_TYPES.map((type) => {
                    const state: DamageState = states[type] ?? "";
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn("capitalize", damageStateStyles(state))}
                        onClick={() =>
                          field.onChange(
                            setDamage(states, type, nextDamageState(state)),
                          )
                        }
                      >
                        {type}
                      </Button>
                    );
                  })}
                </div>
              </FieldGroup>
            );
          }}
        />

        <Controller
          name="condition_immunities"
          control={form.control}
          render={({ field }) => {
            const selected = field.value ?? [];
            return (
              <FieldGroup>
                <FieldLabel className="-mb-1">Condition Immunities</FieldLabel>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 xl:grid-cols-5">
                  {CONDITIONS.map((condition) => {
                    const active = selected.includes(condition.value);
                    const id = `form-rhf-condition-${condition.value}`;
                    return (
                      <Field
                        key={condition.value}
                        orientation="horizontal"
                        className="w-auto items-center"
                      >
                        <Checkbox
                          id={id}
                          checked={active}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...selected, condition.value]
                                : selected.filter((c) => c !== condition.value),
                            )
                          }
                        />
                        <FieldLabel htmlFor={id} className="font-normal">
                          {condition.label}
                        </FieldLabel>
                      </Field>
                    );
                  })}
                </div>
              </FieldGroup>
            );
          }}
        />
      </FieldSet>
    </TooltipProvider>
  );
};
