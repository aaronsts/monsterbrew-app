"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CreatureForm from "./creature-form";
import CreatureStatblock from "./creature-statblock";
import type { z } from "zod";
import { monsterbrewDB } from "@/services/database";
import { createMarkdownPage } from "@/services/converters/markdown";
import {
  createCreatureSchema,
  defaultCreature,
} from "@/schema/createCreatureSchema";
import { Form } from "@/components/ui/form";

export default function Editor() {
  const { id: creatureIdParam } = useSearch({ from: "/legacy-editor" });
  const form = useForm<z.infer<typeof createCreatureSchema>>({
    resolver: zodResolver(createCreatureSchema),
    defaultValues: defaultCreature,
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  async function getLocalCreature() {
    const creatureId = creatureIdParam;
    if (creatureId) {
      const db = await monsterbrewDB();
      const storedCreature = await db.get("creatures", creatureId);
      if (storedCreature) {
        toast.promise(
          (async () => {
            try {
              await form.reset(storedCreature);
              return storedCreature.name;
            } catch (error) {
              console.error("Error loading stored creature:", error);
              throw new Error("Could not load the creature for editing", {
                cause: error,
              });
            }
          })(),
          {
            loading: "Loading creature into editor...",
            success: (name) => `${name} loaded successfully`,
            error: "Failed to load creature",
          },
        );
      }
      db.close();
    } else {
      const storedCreature = localStorage.getItem("editCreature");
      if (storedCreature) {
        toast.promise(
          (async () => {
            try {
              const parsedCreature = JSON.parse(storedCreature);
              form.reset(parsedCreature);
              // Clear the localStorage after loading
              await localStorage.removeItem("editCreature");
              return parsedCreature.name; // Return the name for the success message
            } catch (error) {
              console.error("Error parsing stored creature:", error);
              throw new Error("Could not load the creature for editing", {
                cause: error,
              });
            }
          })(),
          {
            loading: "Loading creature into editor...",
            success: (name) => `${name} loaded successfully`,
            error: "Failed to load creature",
          },
        );
      }
    }
  }

  useEffect(() => {
    getLocalCreature();
  }, []);

  const onSubmit = (values: z.infer<typeof createCreatureSchema>) => {
    createMarkdownPage(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CreatureForm pdfRef={pdfRef} />
          <CreatureStatblock pdfRef={pdfRef} />
        </div>
      </form>
    </Form>
  );
}
