"use client";

import { Button } from "./ui/button";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { monsterbrewDB } from "@/services/database";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

function SaveDialogComponent() {
  const navigate = useNavigate();
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

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

    const db = await monsterbrewDB();

    try {
      if (creature.id) {
        await db.put("creatures", creature);
        toast.success(`Saved ${creature.name}`);
        navigate({ to: "/library/$id", params: { id: creature.id } });
      } else {
        const creatureToSave = {
          ...creature,
          id: generateUniqueId(),
        };
        await db.add("creatures", creatureToSave);
        toast.success(`Saved ${creature.name}`);
        navigate({ to: "/library/$id", params: { id: creatureToSave.id } });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Something went wrong: ${message}`);
      return;
    } finally {
      db.close();
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
