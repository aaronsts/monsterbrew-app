"use client";

import { useForm } from "react-hook-form";
import CreatureForm from "./creature-form";
import CreatureStatblock from "./creature-statblock";
import { z } from "zod";
import {
  createCreatureSchema,
  defaultCreature,
} from "@/schema/createCreatureSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { createMarkdownPage } from "@/services/converters/markdown";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function Editor() {
  const form = useForm<z.infer<typeof createCreatureSchema>>({
    resolver: zodResolver(createCreatureSchema),
    defaultValues: defaultCreature,
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  // Check for creature data in localStorage on component mount
  useEffect(() => {
    const storedCreature = localStorage.getItem("editCreature");
    if (storedCreature) {
      toast.promise(
        (async () => {
          try {
            const parsedCreature = JSON.parse(storedCreature);

            form.reset(parsedCreature);
            // Clear the localStorage after loading
            localStorage.removeItem("editCreature");
            return parsedCreature.name; // Return the name for the success message
          } catch (error) {
            console.error("Error parsing stored creature:", error);
            throw new Error("Could not load the creature for editing");
          }
        })(),
        {
          loading: "Loading creature into editor...",
          success: (name) => `${name} loaded successfully`,
          error: "Failed to load creature",
        }
      );
    }
  }, [form]);

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
