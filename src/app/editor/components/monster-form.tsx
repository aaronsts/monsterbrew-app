"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { IdentityForm } from "./identity-form";
import { CombatForm } from "./combat-form";
import { DefenseForm } from "./defense-form";
import { ActionsForm } from "./actions-form";
import { ImportDialog } from "./import-dialog";
import { AutoSaveIndicator } from "./auto-save-indicator";
import type { Monster } from "@/schema/monster-schema";
import { useCreature, useSaveCreature } from "@/hooks/use-creatures";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useEditCreatureHandoff } from "@/hooks/use-edit-creature-handoff";
import { usePassivePerception } from "@/hooks/use-passive-perception";
import { useSaveNudge } from "@/hooks/use-save-nudge";
import { generateId } from "@/lib/utils";
import { defaultMonster, monsterSchema } from "@/schema/monster-schema";
import { MonsterStatblock } from "@/components/monster-statblock";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

export const MonsterForm = () => {
  const { id: idParam } = useSearch({ from: "/editor" });
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState<string | undefined>();
  const [showImport, setShowImport] = useState(false);
  const { data: loadedCreature } = useCreature(idParam);
  const saveCreature = useSaveCreature();

  const form = useForm({
    resolver: zodResolver(monsterSchema),
    values: loadedCreature ?? defaultMonster,
    resetOptions: { keepDirtyValues: true },
  });

  const handoffId = useEditCreatureHandoff(form, { enabled: !idParam });
  const effectiveId = idParam ?? savedId ?? handoffId;

  usePassivePerception(form);

  const { status: autoSaveStatus } = useAutoSave(form, {
    id: effectiveId,
    enabled: Boolean(effectiveId),
  });

  const preview = useWatch({ control: form.control }) as Monster;

  async function save({ stayInEditor = false } = {}) {
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

    const id = effectiveId ?? generateId();
    const record = { ...parsed.data, id };

    try {
      await saveCreature.mutateAsync(record);
      setSavedId(id);
      toast.success(`Saved ${values.name}`);
      if (stayInEditor) {
        navigate({ to: "/editor", search: { id }, replace: true });
      } else {
        navigate({ to: "/library/$id", params: { id } });
      }
    } catch (err) {
      toast.error(
        `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // The nudge's save keeps you in the editor — it exists to arm auto-save
  // mid-edit, not to end the editing session like the explicit Save button.
  useSaveNudge(form, {
    enabled: !effectiveId,
    onSave: () => save({ stayInEditor: true }),
  });

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex fixed  bottom-2 z-50 inset-x-4 lg:sticky lg:top-18 items-center justify-end gap-2">
          {effectiveId && <AutoSaveIndicator status={autoSaveStatus} />}
          <Button
            type="button"
            color="neutral"
            variant="filled"
            onClick={() => setShowImport(true)}
          >
            <Upload className="size-4" />
            Import
          </Button>
          <Button
            type="button"
            className="w-full lg:w-fit"
            onClick={() => save()}
          >
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
