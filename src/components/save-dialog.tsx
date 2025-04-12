"use client";

import { Button } from "./ui/button";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { monsterbrewDB } from "@/services/database";

export function SaveDialog() {
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

  const creature = formContext.watch();

  async function saveLocally() {
    if (creature.name.length === 0) {
      toast.warning("Please provide a name for the creature");
      return;
    }

    const db = await monsterbrewDB();

    toast.promise(
      (async () => {
        try {
          if (creature.id) {
            await db.put("creatures", creature);
            return `Updated ${creature.name}`;
          } else {
            const creatureToSave = {
              ...creature,
              id: Date.now().toString(),
            };
            await db.add("creatures", creatureToSave);
            return `Saved ${creature.name}`;
          }
        } finally {
          db.close();
        }
      })(),
      {
        loading: creature.id ? "Updating creature..." : "Saving creature...",
        success: (message) => message,
        error: (err) => `Something went wrong: ${err.message}`,
      }
    );
  }

  return (
    <Button variant="outline" type="button" onClick={saveLocally}>
      {creature.id ? "Update" : "Save"}
    </Button>
  );
}
