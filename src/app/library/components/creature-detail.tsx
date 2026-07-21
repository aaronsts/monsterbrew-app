"use client";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Copy, Edit, Trash } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandaloneStatblock } from "@/components/standalone-statblock";
import { MonsterStatblock } from "@/components/monster-statblock";
import { Monster } from "@/schema/monster-schema";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { monsterbrewDB } from "@/services/database";
import { getCreatureFormat } from "@/services/migrations/creatureFormat";
import { MigrateDialog } from "./migrate-dialog";

type MonsterbrewCreature = z.infer<typeof createCreatureSchema>;

export default function CreatureDetail() {
  const { id } = useParams({ from: "/library/$id" });
  const navigate = useNavigate();
  const [creature, setCreature] = useState<MonsterbrewCreature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [migrateOpen, setMigrateOpen] = useState(false);

  async function loadCreature() {
    setIsLoading(true);
    try {
      const db = await monsterbrewDB();
      const stored = await db.get("creatures", id);
      setCreature(stored ?? null);
      db.close();
    } catch (err) {
      toast.error(
        `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCreature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const legacy = creature ? getCreatureFormat(creature) === "legacy" : false;

  // Load the current creature into the editor for editing.
  const loadCreatureIntoEditor = (target: MonsterbrewCreature) => {
    toast.promise(
      new Promise<void>((resolve) => {
        localStorage.setItem("editCreature", JSON.stringify(target));
        navigate({ to: "/editor" });
        resolve();
      }),
      {
        loading: `Loading ${target.name} into editor...`,
        success: `${target.name} ready for editing`,
        error: "Failed to load creature",
      },
    );
  };

  // Editing a legacy creature prompts migration first; a new one opens directly.
  const handleEdit = () => {
    if (!creature) return;
    if (legacy) {
      setMigrateOpen(true);
    } else {
      loadCreatureIntoEditor(creature);
    }
  };

  // Duplicate the creature and open the copy in the editor.
  const handleDuplicate = () => {
    if (!creature) return;
    const creatureCopy = { ...creature };
    delete creatureCopy.id;
    creatureCopy.name = `Copy of ${creature.name}`;
    localStorage.setItem("editCreature", JSON.stringify(creatureCopy));
    navigate({ to: "/editor" });
  };

  // Delete the creature and return to the library.
  const handleDelete = () => {
    if (!creature) return;
    toast.promise(
      (async () => {
        const db = await monsterbrewDB();
        try {
          if (!creature.id) {
            throw new Error("Could not find creature to delete");
          }
          await db.delete("creatures", creature.id);
          return creature.name;
        } finally {
          db.close();
        }
      })(),
      {
        loading: `Deleting ${creature.name}...`,
        success: (name) => {
          navigate({ to: "/library" });
          return `${name} deleted successfully`;
        },
        error: (err) => `Error deleting creature: ${err.message}`,
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p>Loading creature...</p>
      </div>
    );
  }

  if (!creature) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p>Creature not found.</p>
        <Link to="/library">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/library">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to library
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {legacy && (
            <Badge variant="outline" className="text-amber-400">
              Legacy
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {legacy ? (
        <StandaloneStatblock creature={creature} />
      ) : (
        <MonsterStatblock creature={creature as unknown as Monster} columns />
      )}

      <MigrateDialog
        creature={migrateOpen ? creature : null}
        open={migrateOpen}
        onOpenChange={setMigrateOpen}
        onMigrated={loadCreature}
      />
    </div>
  );
}
