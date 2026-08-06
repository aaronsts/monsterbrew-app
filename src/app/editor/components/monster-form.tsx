"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { TriangleAlert, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActionsForm } from "./actions-form";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { CombatForm } from "./combat-form";
import { CrCalculator } from "./cr-calculator";
import { CrSuggestionsToggle } from "./cr-calculator/cr-suggestions-toggle";
import { DefenseForm } from "./defense-form";
import { DerivedValues } from "./derived-values";
import { IdentityForm } from "./identity-form";
import { ImportDialog } from "./import-dialog";
import { NewCreatureDialog } from "./new-creature";
import { StatblockPreview } from "./statblock-preview";
import type { Monster, StoredMonster } from "@/schema/monster-schema";
import { defaultMonster, monsterSchema } from "@/schema/monster-schema";
import { generateId } from "@/lib/utils";
import { useSaveNudge } from "@/hooks/use-save-nudge";
import { useEditCreatureHandoff } from "@/hooks/use-edit-creature-handoff";
import { useCreature, useSaveCreature } from "@/hooks/use-creatures";
import { useAutoSave } from "@/hooks/use-auto-save";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export const MonsterForm = () => {
  const { id: idParam } = useSearch({ from: "/editor" });
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState<string | undefined>();
  const [showImport, setShowImport] = useState(false);
  const { data: loadedCreature } = useCreature(idParam);
  const saveCreature = useSaveCreature();

  const [launcher, setLauncher] = useState<{
    id: string | undefined;
    hadHandoff: boolean;
    dismissed: boolean;
    starter: Monster | null;
  }>(() => ({
    id: idParam,
    hadHandoff:
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("editCreature")),
    dismissed: false,
    starter: null,
  }));
  if (launcher.id !== idParam) {
    setLauncher({
      id: idParam,
      hadHandoff: false,
      dismissed: false,
      starter: null,
    });
  }

  const dismissLauncher = () =>
    setLauncher((current) => ({ ...current, dismissed: true }));

  const showLauncher = !idParam && !launcher.hadHandoff && !launcher.dismissed;

  const [hydration, setHydration] = useState<{
    id: string | undefined;
    creature: StoredMonster | null;
  }>({ id: idParam, creature: null });
  if (hydration.id !== idParam || (!hydration.creature && loadedCreature)) {
    setHydration({ id: idParam, creature: loadedCreature ?? null });
  }

  const form = useForm({
    resolver: zodResolver(monsterSchema),
    values: hydration.creature ?? launcher.starter ?? defaultMonster,
    resetOptions: { keepDirtyValues: true },
  });

  const handoffId = useEditCreatureHandoff(form, { enabled: !idParam });
  const effectiveId = idParam ?? savedId ?? handoffId;

  const { status: autoSaveStatus } = useAutoSave(form, {
    id: effectiveId,
    // When loading via ?id=, wait until the stored creature has hydrated the
    // form, otherwise a slow load could let auto-save persist the blank
    // default form over the stored creature.
    enabled: Boolean(effectiveId) && (!idParam || hydration.creature != null),
  });

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

  const showSaveNudge = useSaveNudge(form, { enabled: !effectiveId });

  function startFromCreature(monster: Monster) {
    setLauncher((current) => ({
      ...current,
      starter: monster,
      dismissed: true,
    }));
    toast.success(`Started from ${monster.name}`);
  }

  return (
    <Form {...form}>
      <DerivedValues />
      <NewCreatureDialog
        open={showLauncher && !showImport}
        onStartBlank={dismissLauncher}
        onImport={() => setShowImport(true)}
        onPickCreature={startFromCreature}
        onPickRecent={(id: string) =>
          navigate({ to: "/editor", search: { id } })
        }
      />
      <div className="space-y-4">
        <div className="flex fixed bg-background py-2 bottom-2 z-50 inset-x-4 lg:sticky lg:top-14 items-center justify-end gap-2">
          {showSaveNudge && (
            <Alert variant="info" className="max-w-lg mr-auto">
              <TriangleAlert />
              <AlertTitle>You have unsaved changes</AlertTitle>
              <AlertDescription>
                Save this creature to turn on auto-save.
              </AlertDescription>
              <AlertAction>
                <Button size="xs" onClick={() => save({ stayInEditor: true })}>
                  Save now
                </Button>
              </AlertAction>
            </Alert>
          )}
          {effectiveId && <AutoSaveIndicator status={autoSaveStatus} />}
          <CrSuggestionsToggle />
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
            className="grow lg:grow-0"
            onClick={() => save()}
          >
            {effectiveId ? "Update" : "Save"}
          </Button>
        </div>
        <CrCalculator />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form className="space-y-6">
            <IdentityForm />
            <CombatForm />
            <DefenseForm />
            <ActionsForm />
          </form>
          <div className="lg:sticky lg:top-30 lg:h-fit lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto">
            <StatblockPreview />
          </div>
        </div>
      </div>
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImported={dismissLauncher}
      />
    </Form>
  );
};
