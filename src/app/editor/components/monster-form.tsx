"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  defaultMonster,
  monsterSchema,
  Monster,
} from "@/schema/monster-schema";
import { MonsterStatblock } from "@/components/monster-statblock";
import { monsterbrewDB } from "@/services/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IdentityForm } from "./identity-form";
import { CombatForm } from "./combat-form";
import { DefenseForm } from "./defense-form";
import { ActionsForm } from "./actions-form";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const MonsterForm = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [creatureId, setCreatureId] = useState<string | undefined>();

  const form = useForm({
    resolver: zodResolver(monsterSchema),
    defaultValues: defaultMonster,
  });

  useEffect(() => {
    async function loadMonster() {
      const id = params.get("id");
      if (id) {
        const db = await monsterbrewDB();
        const stored = await db.get("creatures", id);
        db.close();
        if (stored) {
          setCreatureId(id);
          form.reset(stored as unknown as Monster);
        }
        return;
      }

      const handoff = localStorage.getItem("editCreature");
      if (handoff) {
        try {
          const parsed = JSON.parse(handoff);
          if (parsed.id) setCreatureId(parsed.id);
          form.reset(parsed as Monster);
        } catch (error) {
          console.error("Error parsing stored creature:", error);
        } finally {
          localStorage.removeItem("editCreature");
        }
      }
    }
    loadMonster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    const values = form.getValues();
    if (!values.name || values.name.trim().length === 0) {
      toast.warning("Please provide a name for the creature");
      return;
    }

    const parsed = monsterSchema.safeParse(values);
    if (!parsed.success) {
      form.trigger();
      toast.warning("Please fix the highlighted fields before saving");
      return;
    }

    const id = creatureId ?? generateId();
    const record = { ...parsed.data, id };

    const db = await monsterbrewDB();
    try {
      await db.put(
        "creatures",
        record as unknown as Parameters<typeof db.put>[1],
      );
      setCreatureId(id);
      toast.success(`Saved ${values.name}`);
      router.push(`/my-creatures?id=${id}`);
    } catch (err) {
      toast.error(
        `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      db.close();
    }
  }

  const preview = form.watch();

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" onClick={save}>
            {creatureId ? "Update" : "Save"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form className="space-y-6">
            <IdentityForm />
            <CombatForm />
            <DefenseForm />
            <ActionsForm />
          </form>
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <MonsterStatblock creature={preview} />
          </div>
        </div>
      </div>
    </Form>
  );
};
