"use client";

import { Form } from "@/components/ui/form";
import { defaultMonster, monsterSchema } from "@/schema/monster-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IdentityForm } from "./identity-form";
import { CombatForm } from "./combat-form";
import { DefenseForm } from "./defense-form";
import { ActionsForm } from "./actions-form";

export const MonsterForm = () => {
  const form = useForm({
    resolver: zodResolver(monsterSchema),
    defaultValues: defaultMonster,
  });

  return (
    <Form {...form}>
      <form className="space-y-6">
        <IdentityForm />
        <CombatForm />
        <DefenseForm />
        <ActionsForm />
      </form>
    </Form>
  );
};
