import { Controller, useFormContext } from "react-hook-form";
import { ShieldAlert, ShieldCheck, ShieldHalf } from "lucide-react";
import {
  DAMAGE_STATE_ICONS,
  damageStateStyles,
  nextDamageState,
  setDamage,
} from "./helpers";
import type { Monster } from "@/schema/monster-schema";
import type { DamageState } from "./helpers";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { DAMAGE_TYPES } from "@/types/types";

export function DamageModifiersField() {
  const form = useFormContext<Monster>();

  return (
    <Controller
      name="damage_modifiers"
      control={form.control}
      render={({ field }) => {
        const states = field.value ?? {};
        return (
          <FieldGroup>
            <span className="inline-flex flex-col items-start">
              <FieldLabel>Damage Modifiers</FieldLabel>
              <div className="flex gap-2 text-muted-foreground italic text-[10px]">
                <p className="inline-flex items-center gap-1">
                  <ShieldAlert
                    className="size-3 text-destructive-500"
                    aria-hidden
                  />
                  <span className="font-semibold text-destructive-500">
                    Red
                  </span>{" "}
                  — Vulnerable (double damage)
                </p>
                <p className="inline-flex items-center gap-1">
                  <ShieldHalf className="size-3 text-warning-500" aria-hidden />
                  <span className="font-semibold text-warning-500">
                    Amber
                  </span>{" "}
                  — Resistant (half damage)
                </p>
                <p className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3 text-success-500" aria-hidden />
                  <span className="font-semibold text-success-500">
                    Green
                  </span>{" "}
                  — Immune (no damage)
                </p>
              </div>
            </span>
            <div className="flex flex-wrap gap-1">
              {DAMAGE_TYPES.map((type) => {
                const state: DamageState = states[type] ?? "";
                const StateIcon = state ? DAMAGE_STATE_ICONS[state] : null;
                return (
                  <Button
                    key={type}
                    type="button"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    className={cn("capitalize", damageStateStyles(state))}
                    onClick={() =>
                      field.onChange(
                        setDamage(states, type, nextDamageState(state)),
                      )
                    }
                  >
                    {StateIcon && <StateIcon aria-hidden />}
                    {type}
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
