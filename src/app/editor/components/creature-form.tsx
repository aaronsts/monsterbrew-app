"use client";

import { Card, CardTitle } from "@/components/ui/card";

import MovementForm from "./form/movements-form";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormContext } from "react-hook-form";
import { createMarkdownPage } from "@/services/converters/markdown";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { z } from "zod";
import { ImportDialog } from "@/components/import-dialog";
import { toImprovedInitiative } from "@/services/converters/improvedInitiative";
import { useReactToPrint } from "react-to-print";
import { RefObject, useEffect, useState } from "react";
import { SaveDialog } from "@/components/save-dialog";
import { EllipsisVertical, RotateCcw } from "lucide-react";
import { calculateStatBonus } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MythicActionsForm } from "./form/mythic-actions.form";

function CreatureForm({
  pdfRef,
}: {
  pdfRef: RefObject<HTMLDivElement | null>;
}) {
  const [showModal, setShowModal] = useState(false);

  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

  const isLegendary = formContext.watch("is_legendary");
  const isMythic = formContext.watch("is_mythic");
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

  useEffect(() => {
    let passivePerception = calculateStatBonus(creature.ability_scores.wis);
    const isProficientOrExpert = creature.skill_bonuses.find(
      (s) => s.skill_name === "perception"
    );
    if (!!isProficientOrExpert) {
      passivePerception += isProficientOrExpert.is_expert
        ? creature.cr.proficiency_bonus * 2
        : creature.cr.proficiency_bonus;
    }
    formContext.setValue("passive_perception", 10 + passivePerception);
  }, [creature.ability_scores.wis, creature.skill_bonuses]);

  return (
    <Card className="h-fit md:pt-0">
      <div className="flex sticky bg-carrara-50 rounded-t-xl pb-1 border-carrara-100 top-14 z-40 pt-6 mb-6 flex-row items-center justify-between">
        <CardTitle className="w-fit">
          {creature.id ? "Update" : "Create"} creature
        </CardTitle>
        <div className="flex gap-2">
          <ImportDialog open={showModal} onOpenChange={setShowModal} />
          <SaveDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="transparant" color="carrara" size="icon">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setShowModal(true)}>
                  Import
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Export</DropdownMenuLabel>
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
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => formContext.reset()}>
                  reset
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Accordion type="multiple" defaultValue={["general-info"]}>
        <AccordionItem value="general-info" defaultChecked>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AccordionTrigger className="flex-1">
                General Info
              </AccordionTrigger>
            </div>
            <Button
              type="button"
              variant="light"
              color="destructive"
              size="icon-sm"
              onClick={() =>
                formContext.reset({
                  ...formContext.getValues(),
                  name: "",
                  type: "",
                  size: "",
                  alignment: "",
                  armor_class: "",
                  armor_description: "",
                  hit_dice: "",
                  hit_points: "",
                  custom_hp: false,
                  ability_scores: {
                    str: 10,
                    con: 10,
                    dex: 10,
                    int: 10,
                    wis: 10,
                    cha: 10,
                  },
                })
              }
            >
              <RotateCcw />
            </Button>
          </div>
          <AccordionContent>
            <GeneralInfoForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="movement-senses">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AccordionTrigger className="flex-1">
                Movement & Senses
              </AccordionTrigger>
            </div>
            <Button
              type="button"
              variant="light"
              color="destructive"
              size="icon-sm"
              onClick={() =>
                formContext.reset({
                  ...formContext.getValues(),
                  movements: {},
                  senses: {},
                })
              }
            >
              <RotateCcw />
            </Button>
          </div>
          <AccordionContent className="space-y-3">
            <MovementForm />
            <SensesForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="languages-skills">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AccordionTrigger className="flex-1">
                Languages & Skills
              </AccordionTrigger>
            </div>
            <Button
              type="button"
              variant="light"
              color="destructive"
              size="icon-sm"
              onClick={() =>
                formContext.reset({
                  ...formContext.getValues(),
                  languages: [],
                  saving_throws: [],
                  skill_bonuses: [],
                })
              }
            >
              <RotateCcw />
            </Button>
          </div>
          <AccordionContent className="space-y-3">
            <LanguagesForm />
            <SavingThrowsForm />
            <SkillBonusForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="damages-conditions">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AccordionTrigger className="flex-1">
                Damages & Conditions
              </AccordionTrigger>
            </div>
            <Button
              type="button"
              variant="light"
              color="destructive"
              size="icon-sm"
              onClick={() =>
                formContext.reset({
                  ...formContext.getValues(),
                  damage_immunities: [],
                  damage_resistances: [],
                  damage_vulnerabilities: [],
                  condition_immunities: [],
                })
              }
            >
              <RotateCcw />
            </Button>
          </div>
          <AccordionContent className="space-y-3">
            <DamageTypesForm />
            <ConditionTypesForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="features-actions" className="relative">
          <div className="pt-3 -mb-1 md:pt-0 md:absolute top-4 left-36 flex gap-3">
            <div className="flex gap-2">
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
            <div className="flex gap-2">
              <Checkbox
                id="isMythic"
                checked={isMythic}
                onCheckedChange={(e) =>
                  formContext.setValue("is_mythic", e as boolean)
                }
              />
              <Label
                htmlFor="isMythic"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Is Mythic
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AccordionTrigger className="flex-1">
                Traits & Actions
              </AccordionTrigger>
            </div>
            <Button
              type="button"
              variant="light"
              color="destructive"
              size="icon-sm"
              onClick={() =>
                formContext.reset({
                  ...formContext.getValues(),
                  actions: [],
                  reactions: [],
                  traits: [],
                  legendary_actions: [],
                  legendary_description: "",
                })
              }
            >
              <RotateCcw />
            </Button>
          </div>

          <AccordionContent className="space-y-3">
            <TraitsForm />
            <ActionsForm />
            <ReactionsForm />
            {isLegendary && <LegendaryActionsForm />}
            {isMythic && <MythicActionsForm />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default CreatureForm;
