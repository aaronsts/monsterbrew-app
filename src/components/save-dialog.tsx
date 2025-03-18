"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { openDB } from "idb";
import { monsterbrewDB } from "@/services/database";

export function SaveDialog() {
  const [showModal, setShowModal] = useState(false);
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

  const creature = formContext.watch();

  async function saveLocally() {
    if (creature.name.length === 0) {
      toast.warning("Please provide a name for the creature");
      return;
    }
    const db = await monsterbrewDB();
    db.add("creatures", creature, creature.name)
      .then((res) => {
        console.log(res);
        toast.success(`Successfully saved ${creature.name}.`);
      })
      .catch((err) => {
        console.log(err);
        toast.error(`Something went wrong: ${err.message}`);
      });
    db.close();
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button variant="outline">Save</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save creature</DialogTitle>
            <DialogDescription>Choose to save your creature.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96 bg-background rounded-md p-1"></ScrollArea>
          <DialogFooter className="items-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={saveLocally}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export async function demo3() {
  const db1 = await openDB("db1", 1);
  db1
    .add("store1", "hello again!!", "new message")
    .then((result) => {
      console.log("success!", result);
    })
    .catch((err) => {
      console.error("error: ", err);
    });
  db1.close();
}
