"use client";

import { Button } from "./ui/button";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { monsterbrewDB } from "@/services/database";
import { useRouter } from "next/navigation";

export function SaveDialog() {
  const router = useRouter();
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

  const creature = formContext.watch();

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
          id: Date.now().toString(),
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
    <Button variant="outline" type="button" onClick={saveLocally}>
      {creature.id ? "Update" : "Save"}
    </Button>
  );
}
