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

export default function Editor() {
  const form = useForm<z.infer<typeof createCreatureSchema>>({
    resolver: zodResolver(createCreatureSchema),
    defaultValues: defaultCreature,
  });

  const onSubmit = (values: z.infer<typeof createCreatureSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 p-3 gap-3">
          <CreatureForm />
          <CreatureStatblock />
        </div>
      </form>
    </Form>
  );
}
