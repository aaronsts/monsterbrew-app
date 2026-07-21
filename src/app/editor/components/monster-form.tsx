"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  defaultMonster,
  monsterSchema,
  Monster,
} from "@/schema/monster-schema";
import { MonsterStatblock } from "@/components/monster-statblock";
import { calculateStatBonus, generateId } from "@/lib/utils";
import { monsterbrewDB } from "@/services/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { IdentityForm } from "./identity-form";
import { CombatForm } from "./combat-form";
import { DefenseForm } from "./defense-form";
import { ActionsForm } from "./actions-form";
import { ImportDialog } from "./import-dialog";

export const MonsterForm = () => {
  const { id: idParam } = useSearch({ from: "/editor" });
  const navigate = useNavigate();
  const [creatureId, setCreatureId] = useState<string | undefined>();
  const [showImport, setShowImport] = useState(false);

  const form = useForm({
    resolver: zodResolver(monsterSchema),
    defaultValues: defaultMonster,
  });

  useEffect(() => {
    async function loadMonster() {
      const id = idParam;
      if (id) {
        const db = await monsterbrewDB();
        const stored = await db.get("creatures", id);
        db.close();
        if (stored) {
          setCreatureId(id);
          form.reset(stored as unknown as Monster);
        }
        return;
      }

      const handoff = localStorage.getItem("editCreature");
      if (handoff) {
        try {
          const parsed = JSON.parse(handoff);
          if (parsed.id) setCreatureId(parsed.id);
          form.reset(parsed as Monster);
        } catch (error) {
          console.error("Error parsing stored creature:", error);
        } finally {
          localStorage.removeItem("editCreature");
        }
      }
    }
    loadMonster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wis = form.watch("ability_scores.wis");
  const skills = form.watch("skills");
  const proficiencyBonus = form.watch("cr.proficiency_bonus");
  const customPassivePerception = form.watch("custom_passive_perception");

  useEffect(() => {
    if (customPassivePerception) return;
    let perception = calculateStatBonus(wis);
    const perceptionProficiency = skills?.perception;
    if (perceptionProficiency) {
      perception +=
        perceptionProficiency === "expert"
          ? proficiencyBonus * 2
          : proficiencyBonus;
    }
    form.setValue("passive_perception", 10 + perception);
  }, [wis, skills, proficiencyBonus, customPassivePerception, form]);

  async function save() {
    const values = form.getValues();
    if (!values.name || values.name.trim().length === 0) {
      toast.warning("Please provide a name for the creature");
      return;
    }

    const parsed = monsterSchema.safeParse(values);
    if (!parsed.success) {
      form.trigger();
      toast.warning("Please fix the highlighted fields before saving");
      return;
    }

    const id = creatureId ?? generateId();
    const record = { ...parsed.data, id };

    const db = await monsterbrewDB();
    try {
      await db.put(
        "creatures",
        record as unknown as Parameters<typeof db.put>[1],
      );
      setCreatureId(id);
      toast.success(`Saved ${values.name}`);
      navigate({ to: "/library/$id", params: { id } });
    } catch (err) {
      toast.error(
        `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      db.close();
    }
  }

  const preview = form.watch();

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex fixed bottom-2 z-50 inset-x-4 lg:sticky lg:top-18 justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setShowImport(true)}
          >
            <Upload className="size-4" />
            Import
          </Button>
          <Button
            type="button"
            className="w-full lg:w-fit"
            size="lg"
            onClick={save}
          >
            {creatureId ? "Update" : "Save"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form className="space-y-6">
            <IdentityForm />
            <CombatForm />
            <DefenseForm />
            <ActionsForm />
          </form>
          <div className="lg:sticky lg:top-30 lg:h-fit lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto">
            <MonsterStatblock creature={preview} />
          </div>
        </div>
      </div>
      <ImportDialog open={showImport} onOpenChange={setShowImport} />
    </Form>
  );
};
