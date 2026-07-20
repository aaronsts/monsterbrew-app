import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Monster } from "@/schema/monster-schema";
import { DAMAGE_TYPES } from "@/types/types";
import { Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  DamageState,
  damageStateStyles,
  nextDamageState,
  setDamage,
} from "./helpers";

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
                      <span className="font-semibold text-red-400">Red</span> —
                      Vulnerable (double damage)
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
  );
}
