"use client";

import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { Button } from "./ui/button";
import type { z } from "zod";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useSaveCreature } from "@/hooks/use-creatures";

function SaveDialogComponent() {
  const navigate = useNavigate();
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();
  const saveCreature = useSaveCreature();

  const creature = formContext.watch();

  // Use useCallback to ensure this function is created at runtime
  const generateUniqueId = useCallback(() => {
    // This will run on the client side at runtime
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  async function saveLocally() {
    if (creature.name.length === 0) {
      toast.warning("Please provide a name for the creature");
      return;
    }

    const creatureToSave = creature.id
      ? creature
      : { ...creature, id: generateUniqueId() };

    try {
      const saved = await saveCreature.mutateAsync(creatureToSave);
      toast.success(`Saved ${saved.name}`);
      navigate({ to: "/library/$id", params: { id: saved.id! } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Something went wrong: ${message}`);
    }
  }

  return (
    <Button
      variant="default"
      type="button"
      onClick={saveLocally}
      title={creature.id ? "Update Creature" : "Save Creature"}
    >
      {creature.id ? "Update" : "Save"}
    </Button>
  );
}

export function SaveDialog() {
  return <SaveDialogComponent />;
}
