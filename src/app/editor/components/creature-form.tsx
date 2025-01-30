"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import MovementForm from "./form/movements-form";
import AbilityScoresForm from "./form/ability-scores-form";
import SensesForm from "./form/senses-form";
import SavingThrowsForm from "./form/saving-throws-form";
import LanguagesForm from "./form/languages-form";
import SkillBonusForm from "./form/skill-bonus-form";
import DamageTypesForm from "./form/damage-types-form";
import { FeatureForm } from "./form/features-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GeneralInfoForm } from "./form/general-info-form";

function CreatureForm() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Create creature</CardTitle>
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
          <AccordionItem value="features">
            <AccordionTrigger>Features</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <FeatureForm />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default CreatureForm;
