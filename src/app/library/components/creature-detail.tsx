"use client";
import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Copy, Edit, Trash } from "lucide-react";
import type { StoredMonster } from "@/schema/monster-schema";

import { Button } from "@/components/ui/button";
import { MonsterStatblock } from "@/components/monster-statblock";
import { CreatureExportMenu } from "@/app/library/components/creature-export-menu";
import { useCreature, useDeleteCreature } from "@/hooks/use-creatures";

export default function CreatureDetail() {
  const { id } = useParams({ from: "/library/$id" });
  const navigate = useNavigate();
  const {
    data: creature = null,
    isPending: isLoading,
    error,
  } = useCreature(id);
  const deleteCreature = useDeleteCreature();

  const statblockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      toast.error(
        `Something went wrong: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [error]);

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
        if (!creature.id) {
          throw new Error("Could not find creature to delete");
        }
        await deleteCreature.mutateAsync(creature.id);
        return creature.name;
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
          <CreatureExportMenu creature={creature} statblockRef={statblockRef} />
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

      <div ref={statblockRef}>
        <MonsterStatblock creature={creature} columns />
      </div>
    </div>
  );
}
