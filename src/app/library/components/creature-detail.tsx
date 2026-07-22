"use client";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Copy, Edit, Trash } from "lucide-react";
import type { StoredMonster } from "@/schema/monster-schema";

import { Button } from "@/components/ui/button";
import { MonsterStatblock } from "@/components/monster-statblock";
import { monsterbrewDB } from "@/services/database";

export default function CreatureDetail() {
  const { id } = useParams({ from: "/library/$id" });
  const navigate = useNavigate();
  const [creature, setCreature] = useState<StoredMonster | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load the current creature into the editor for editing.
  const loadCreatureIntoEditor = (target: StoredMonster) => {
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

  const handleEdit = () => {
    if (!creature) return;
    loadCreatureIntoEditor(creature);
  };

  // Duplicate the creature and open the copy in the editor as a new creature.
  const handleDuplicate = () => {
    if (!creature) return;
    const { id: _id, ...rest } = creature;
    const creatureCopy = { ...rest, name: `Copy of ${creature.name}` };
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

      <MonsterStatblock creature={creature} columns />
    </div>
  );
}
