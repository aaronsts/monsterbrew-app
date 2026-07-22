"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CreatureForm from "./creature-form";
import CreatureStatblock from "./creature-statblock";
import type { z } from "zod";
import { useCreature } from "@/hooks/use-creatures";
import { createMarkdownPage } from "@/services/converters/markdown";
import {
  createCreatureSchema,
  defaultCreature,
} from "@/schema/createCreatureSchema";
import { Form } from "@/components/ui/form";

export default function Editor() {
  const { id: creatureIdParam } = useSearch({ from: "/legacy-editor" });

  const pdfRef = useRef<HTMLDivElement>(null);

  const { data: storedCreature } = useCreature(creatureIdParam);

  const form = useForm<z.infer<typeof createCreatureSchema>>({
    resolver: zodResolver(createCreatureSchema),
    values: storedCreature ?? defaultCreature,
  });

  const { reset } = form;

  // Fallback handoff (no id in the URL): hydrate from localStorage once.
  useEffect(() => {
    if (creatureIdParam) return;
    const handoff = localStorage.getItem("editCreature");
    if (!handoff) return;
    toast.promise(
      (async () => {
        try {
          const parsedCreature = await JSON.parse(handoff);
          reset(parsedCreature);
          // Clear the localStorage after loading
          localStorage.removeItem("editCreature");
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
  }, [creatureIdParam, reset]);

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
