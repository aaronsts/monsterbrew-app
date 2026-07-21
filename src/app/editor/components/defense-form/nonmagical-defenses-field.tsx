import { Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  NONMAGICAL_ATTACK_TYPES,
  damageStateStyles,
  nextNonmagicalState,
  setNonmagical,
} from "./helpers";
import type { NonmagicalState } from "./helpers";
import type { Monster } from "@/schema/monster-schema";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
                    Resistance or immunity to bludgeoning, piercing, and
                    slashing from nonmagical weapons.
                  </p>
                  <p>Click to cycle its state:</p>
                  <ul className="space-y-0.5">
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
              {NONMAGICAL_ATTACK_TYPES.map(({ key, label }) => {
                const state: NonmagicalState = states[key] ?? "";
                return (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={damageStateStyles(state)}
                    onClick={() =>
                      field.onChange(
                        setNonmagical(states, key, nextNonmagicalState(state)),
                      )
                    }
                  >
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
