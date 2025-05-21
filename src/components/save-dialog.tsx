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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

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

  const formattings = [
    {
      title: "Showing a creature's name",
      value: "[MON]",
    },
    {
      title: "Showing a creature's modifier",
      value: "[CHA]",
    },
    {
      title: "Calculate a die roll",
      value: "[3D6]",
    },
    {
      title: "Calculate the creatueres attack roll (ex. Strength based attack)",
      value: "[STR ATK]",
    },
    {
      title:
        "Calculate a damage roll w/ modifiers (ex. Dexterity based attack)",
      value: "[DEX 2D8]",
    },
    {
      title: "Calculate the save DC (ex. Wisdom save)",
      value: "[WIS SAVE]",
    },
    {
      title: "Add a flat modifier to a value",
      value: "[3D6 + 1], [WIS SAVE + 3]",
    },
  ];

  return (
    <>
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button
            className="italic font-normal text-xs text-carrara-600 hover:text-carrara-800 hover:underline"
            type="button"
          >
            formatting help
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Formatting</DialogTitle>
          </DialogHeader>
          <h4 className="font-medium">
            Use _ to italicize and ** to bold. For Spellcasting lists, use &gt;
            to reverse-indent.
          </h4>
          <ul className="grid gap-2">
            {formattings.map((formatting) => (
              <li
                key={formatting.title}
                className="flex font-normal justify-between border-b border-carrara-600 py-3"
              >
                <p className="max-w-2/3 text-carrara-900">{formatting.title}</p>
                <p className="font-medium">{formatting.value}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      <Button
        variant="filled"
        color="carrara"
        type="button"
        onClick={saveLocally}
        title={creature.id ? "Update Creature" : "Save Creature"}
      >
        {creature.id ? "Update" : "Save"}
      </Button>
    </>
  );
}

export function SaveDialog() {
  return <DynamicSaveButton />;
}
