"use client";
import { CollapsibleSection } from "../collapsible-section";
import { ConditionImmunitiesField } from "./condition-immunities-field";
import { DamageModifiersField } from "./damage-modifiers-field";
import { NonmagicalDefensesField } from "./nonmagical-defenses-field";
import { SavingThrowsField } from "./saving-throws-field";
import { SkillsField } from "./skills-field";
import { TooltipProvider } from "@/components/ui/tooltip";

export const DefenseForm = () => {
  return (
    <TooltipProvider>
      <CollapsibleSection
        id="defense"
        legend="Defense"
        description="How resilient a creature is against attacks and effects"
      >
        <SavingThrowsField />
        <SkillsField />
        <DamageModifiersField />
        <NonmagicalDefensesField />
        <ConditionImmunitiesField />
      </CollapsibleSection>
    </TooltipProvider>
  );
};
