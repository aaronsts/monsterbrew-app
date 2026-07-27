import { Controller, useFormContext } from "react-hook-form";
import {
  DAMAGE_STATE_ICONS,
  NONMAGICAL_ATTACK_TYPES,
  damageStateStyles,
  nextNonmagicalState,
  setNonmagical,
} from "./helpers";
import type { Monster } from "@/schema/monster-schema";
import type { NonmagicalState } from "./helpers";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";

export function NonmagicalDefensesField() {
  const form = useFormContext<Monster>();

  return (
    <Controller
      name="nonmagical_attack_modifiers"
      control={form.control}
      render={({ field }) => {
        const states = field.value ?? {};
        return (
          <FieldGroup>
            <span className="inline-flex items-center gap-1.5">
              <FieldLabel>Nonmagical Attack Defenses</FieldLabel>
            </span>
            <div className="flex flex-wrap gap-1">
              {NONMAGICAL_ATTACK_TYPES.map(({ key, label }) => {
                const state: NonmagicalState = states[key] ?? "";
                const StateIcon = state ? DAMAGE_STATE_ICONS[state] : null;
                return (
                  <Button
                    key={key}
                    type="button"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    className={damageStateStyles(state)}
                    onClick={() =>
                      field.onChange(
                        setNonmagical(states, key, nextNonmagicalState(state)),
                      )
                    }
                  >
                    {StateIcon && <StateIcon aria-hidden />}
                    {label}
                  </Button>
                );
              })}
            </div>
          </FieldGroup>
        );
      }}
    />
  );
}
