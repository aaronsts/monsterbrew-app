"use client";

import { Button } from "./ui/button";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { monsterbrewDB } from "@/services/database";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import dynamic from "next/dynamic";

const DynamicSaveButton = dynamic(() => Promise.resolve(SaveDialogComponent), {
  ssr: false,
});

function SaveDialogComponent() {
  const router = useRouter();
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
        router.push(`/my-creatures?id=${creature.id}`);
      } else {
        const creatureToSave = {
          ...creature,
          id: generateUniqueId(),
        };
        await db.add("creatures", creatureToSave);
        toast.success(`Saved ${creature.name}`);
        router.push(`/my-creatures?id=${creatureToSave.id}`);
      }
    } catch (err: any) {
      toast.error(`Something went wrong: ${err.message}`);
      return;
    } finally {
      db.close();
    }
  }

  return (
    <Button
      variant="filled"
      color="carrara"
      type="button"
      onClick={saveLocally}
    >
      {creature.id ? "Update" : "Save"}
    </Button>
  );
}

export function SaveDialog() {
  return <DynamicSaveButton />;
}
