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
import { useRef } from "react";

export default function Editor() {
  const form = useForm<z.infer<typeof createCreatureSchema>>({
    resolver: zodResolver(createCreatureSchema),
    defaultValues: defaultCreature,
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  const onSubmit = (values: z.infer<typeof createCreatureSchema>) => {
    createMarkdownPage(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 p-3 gap-3">
          <CreatureForm pdfRef={pdfRef} />
          <CreatureStatblock pdfRef={pdfRef} />
        </div>
      </form>
    </Form>
  );
}
