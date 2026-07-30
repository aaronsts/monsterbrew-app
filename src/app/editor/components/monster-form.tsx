"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { IdentityForm } from "./identity-form";
import { CombatForm } from "./combat-form";
import { DefenseForm } from "./defense-form";
import { ActionsForm } from "./actions-form";
import { ImportDialog } from "./import-dialog";
import type { Monster } from "@/schema/monster-schema";
import { useCreature, useSaveCreature } from "@/hooks/use-creatures";
import { useAutoSave } from "@/hooks/use-auto-save";
import { calculateStatBonus, generateId } from "@/lib/utils";
import { defaultMonster, monsterSchema } from "@/schema/monster-schema";
import { isLegacyCreature } from "@/services/migrations/creatureFormat";
import { creatureToMonster } from "@/services/migrations/creatureToMonster";
import { MonsterStatblock } from "@/components/monster-statblock";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

export const MonsterForm = () => {
  const { id: idParam } = useSearch({ from: "/editor" });
  const navigate = useNavigate();
  const [creatureId, setCreatureId] = useState<string | undefined>();
  const [showImport, setShowImport] = useState(false);
  const { data: loadedCreature } = useCreature(idParam);
  const saveCreature = useSaveCreature();

  const form = useForm({
    resolver: zodResolver(monsterSchema),
    values: loadedCreature ?? defaultMonster,
    // If a background resync ever fires, keep fields the user is editing.
    resetOptions: { keepDirtyValues: true },
  });

  const { control, setValue, reset, getValues, trigger } = form;

  const effectiveId = idParam ?? creatureId;

  // Auto-save is inert until the creature has an id (i.e. after the first
  // manual Save), so we don't spawn junk records while a new creature is drafted.
  const { status: autoSaveStatus } = useAutoSave(form, {
    id: effectiveId,
    enabled: Boolean(effectiveId),
  });

  const preview = useWatch({ control }) as Monster;
  const wis = useWatch({ control, name: "ability_scores.wis" });
  const skills = useWatch({ control, name: "skills" });
  const proficiencyBonus = useWatch({ control, name: "cr.proficiency_bonus" });
  const customPassivePerception = useWatch({
    control,
    name: "custom_passive_perception",
  });

  useEffect(() => {
    if (idParam) return;
    const handoff = localStorage.getItem("editCreature");
    if (!handoff) return;
    try {
      const parsed = JSON.parse(handoff);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed.id) setCreatureId(parsed.id);
      // Handoffs (SRD copy, duplicate, library edit) normally already emit
      // `Monster`, but normalize any stale legacy-shaped payload just in case.
      const monster: Monster = isLegacyCreature(parsed)
        ? creatureToMonster(parsed)
        : (parsed as Monster);
      reset(monster);
    } catch (error) {
      console.error("Error parsing stored creature:", error);
    } finally {
      localStorage.removeItem("editCreature");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (customPassivePerception) return;
    let perception = calculateStatBonus(wis);
    const perceptionProficiency = skills?.perception;
    if (perceptionProficiency) {
      const pb = proficiencyBonus ?? 0;
      perception += perceptionProficiency === "expert" ? pb * 2 : pb;
    }
    setValue("passive_perception", 10 + perception);
  }, [wis, skills, proficiencyBonus, customPassivePerception, setValue]);

  async function save() {
    const values = getValues();
    if (!values.name || values.name.trim().length === 0) {
      toast.warning("Please provide a name for the creature");
      return;
    }

    const parsed = monsterSchema.safeParse(values);
    if (!parsed.success) {
      trigger();
      toast.warning("Please fix the highlighted fields before saving");
      return;
    }

    const id = effectiveId ?? generateId();
    const record = { ...parsed.data, id };

    try {
      await saveCreature.mutateAsync(record);
      setCreatureId(id);
      toast.success(`Saved ${values.name}`);
      navigate({ to: "/library/$id", params: { id } });
    } catch (err) {
      toast.error(
        `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Nudge users editing a brand-new (unsaved) creature to save so auto-save can
  // take over — once, after ~30s or several edits, until they actually save.
  const saveRef = useRef(save);
  saveRef.current = save;
  const nudgeShownRef = useRef(false);

  useEffect(() => {
    if (effectiveId) {
      nudgeShownRef.current = false;
      return;
    }
    let changes = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const nudge = () => {
      if (nudgeShownRef.current) return;
      nudgeShownRef.current = true;
      toast("You have unsaved changes", {
        description: "Save this creature to turn on auto-save.",
        action: { label: "Save now", onClick: () => void saveRef.current() },
      });
    };
    const subscription = form.watch((_value, { type }) => {
      if (type !== "change") return;
      changes += 1;
      if (!timer) timer = setTimeout(nudge, 30_000);
      if (changes >= 10) nudge();
    });
    return () => {
      subscription.unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [effectiveId, form]);

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex fixed  bottom-2 z-50 inset-x-4 lg:sticky lg:top-18 items-center justify-end gap-2">
          {effectiveId && (
            <span
              className="mr-auto hidden items-center text-xs text-muted-foreground lg:flex"
              aria-live="polite"
            >
              {autoSaveStatus === "saving"
                ? "Saving…"
                : autoSaveStatus === "saved"
                  ? "All changes saved"
                  : autoSaveStatus === "error"
                    ? "Couldn’t save changes"
                    : null}
            </span>
          )}
          <Button
            type="button"
            color="neutral"
            variant="filled"
            onClick={() => setShowImport(true)}
          >
            <Upload className="size-4" />
            Import
          </Button>
          <Button type="button" className="w-full lg:w-fit" onClick={save}>
            {effectiveId ? "Update" : "Save"}
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
