"use client";
import { useEffect, useRef } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MonsterStatblock } from "@/components/monster-statblock";
import { CreatureActionsMenu } from "@/app/library/components/creature-actions-menu";
import { useCreature } from "@/hooks/use-creatures";

export default function CreatureDetail() {
  const { id } = useParams({ from: "/library/$id" });
  const {
    data: creature = null,
    isPending: isLoading,
    error,
  } = useCreature(id);

  const statblockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      toast.error(
        `Something went wrong: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [error]);

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
          <Button color="neutral" variant="outline">
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
          <Button color="neutral" variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to library
          </Button>
        </Link>
        <CreatureActionsMenu creature={creature} statblockRef={statblockRef} />
      </div>

      <div ref={statblockRef}>
        <MonsterStatblock creature={creature} columns />
      </div>
    </div>
  );
}
