import { Controller, useFormContext } from "react-hook-form";
import { damageStateStyles, nextDamageState, setDamage } from "./helpers";
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
                <p>
                  <span className="font-semibold text-red-400">Red</span> —
                  Vulnerable (double damage)
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Amber</span> —
                  Resistant (half damage)
                </p>
                <p>
                  <span className="font-semibold text-green-500">Green</span> —
                  Immune (no damage)
                </p>
              </div>
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
  );
}
