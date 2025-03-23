"use client";

import { Card, CardTitle } from "@/components/ui/card";

import MovementForm from "./form/movements-form";
import AbilityScoresForm from "./form/ability-scores-form";
import SensesForm from "./form/senses-form";
import SavingThrowsForm from "./form/saving-throws-form";
import LanguagesForm from "./form/languages-form";
import SkillBonusForm from "./form/skill-bonus-form";
import DamageTypesForm from "./form/damage-types-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GeneralInfoForm } from "./form/general-info-form";
import { ActionsForm } from "./form/actions-form";
import { Button } from "@/components/ui/button";
import { ReactionsForm } from "./form/reactions-form";
import { TraitsForm } from "./form/traits-form";
import { LegendaryActionsForm } from "./form/legendary-actions-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ConditionTypesForm from "./form/condition-types-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormContext } from "react-hook-form";
import { createMarkdownPage } from "@/services/converters/markdown";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { z } from "zod";
import { ImportDialog } from "@/components/import-dialog";
import { toImprovedInitiative } from "@/services/converters/improved-initiative";
import { useReactToPrint } from "react-to-print";
import { RefObject } from "react";
import { SaveDialog } from "@/components/save-dialog";

function CreatureForm({
  pdfRef,
}: {
  pdfRef: RefObject<HTMLDivElement | null>;
}) {
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

  const isLegendary = formContext.watch("is_legendary");
  const creature = formContext.watch();

  const reactToPrintFn = useReactToPrint({ contentRef: pdfRef });

  const exportData = (jsonOutput: typeof ImprovedInitiativeCreature) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(jsonOutput)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${
      creature.name.replaceAll(" ", "-") ?? "monsterbrew-creature"
    }.json`;
    link.click();
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle className="w-fit">Create creature</CardTitle>
        <div className="flex gap-2">
          <ImportDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={formContext.handleSubmit(
                  (v: z.infer<typeof createCreatureSchema>) =>
                    createMarkdownPage(v)
                )}
              >
                Homebrewery V3
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={formContext.handleSubmit(
                  (v: z.infer<typeof createCreatureSchema>) =>
                    exportData(toImprovedInitiative(v))
                )}
              >
                Improved Initiative
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => reactToPrintFn()}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SaveDialog />
        </div>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[
          "general-info",
          "languages-skills",
          "movement-senses",
          "damages-conditions",
          "features",
        ]}
      >
        <AccordionItem value="general-info" defaultChecked>
          <AccordionTrigger>General Info</AccordionTrigger>
          <AccordionContent>
            <GeneralInfoForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="movement-senses">
          <AccordionTrigger>Movement & Senses</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <MovementForm />
            <AbilityScoresForm />
            <SensesForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="languages-skills">
          <AccordionTrigger>Languages & Skills</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <LanguagesForm />
            <SavingThrowsForm />
            <SkillBonusForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="damages-conditions">
          <AccordionTrigger>Damages & Conditions</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <DamageTypesForm />
            <ConditionTypesForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="features-actions" className="relative">
          <div
            className="flex gap-1.5 items-center w-fit absolute left-33
           top-[18px]"
          >
            <Checkbox
              id="isLegendary"
              checked={isLegendary}
              onCheckedChange={(e) =>
                formContext.setValue("is_legendary", e as boolean)
              }
            />
            <Label
              htmlFor="isLegendary"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Is Legendary
            </Label>
          </div>
          <AccordionTrigger>Traits & Actions</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <TraitsForm />
            <ActionsForm />
            <ReactionsForm />
            {isLegendary && <LegendaryActionsForm />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default CreatureForm;
