"use client";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConditionImmunitiesField } from "./condition-immunities-field";
import { DamageModifiersField } from "./damage-modifiers-field";
import { SavingThrowsField } from "./saving-throws-field";
import { SkillsField } from "./skills-field";

export const DefenseForm = () => {
  return (
    <TooltipProvider>
      <FieldSet>
        <FieldLegend>Defense</FieldLegend>
        <FieldDescription>
          How resilient a creature is against attacks and effects
        </FieldDescription>

        <SavingThrowsField />
        <SkillsField />
        <DamageModifiersField />
        <ConditionImmunitiesField />
      </FieldSet>
    </TooltipProvider>
  );
};
