"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function CreatureForm() {
  const [isLegendary, setIsLegendary] = useState<string | boolean>(false);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Create creature</CardTitle>
        <div className="w-full mt-3 flex  justify-end">
          <Button>Submit</Button>
        </div>
      </CardHeader>
      <CardContent>
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="features-actions" className="relative">
            <div className="flex gap-1.5 items-center w-fit absolute left-28 top-[18px]">
              <Checkbox
                id="isLegendary"
                onCheckedChange={(e) => setIsLegendary(e.valueOf())}
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

              {isLegendary && <LegendaryActionsForm />}
              <ReactionsForm />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="w-full mt-3 flex  justify-end">
          <Button>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatureForm;
