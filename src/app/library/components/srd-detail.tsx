"use client";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, PencilRuler } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonsterStatblock } from "@/components/monster-statblock";
import { getSrdMonster } from "@/services/srd";

export default function SrdDetail() {
  const { key } = useParams({ from: "/library/srd/$key" });
  const navigate = useNavigate();
  const entry = getSrdMonster(key);

  // Load a copy of the SRD monster into the editor as a fresh, unsaved creature.
  const copyToEditor = () => {
    if (!entry) return;
    toast.promise(
      new Promise<void>((resolve) => {
        localStorage.setItem("editCreature", JSON.stringify(entry.monster));
        navigate({ to: "/editor" });
        resolve();
      }),
      {
        loading: `Opening ${entry.monster.name} in the editor...`,
        success: `${entry.monster.name} copied to the editor`,
        error: "Failed to open the editor",
      },
    );
  };

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p>SRD monster not found.</p>
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
        <Link to="/library" search={{ source: "srd" }}>
          <Button color="neutral" variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to library
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline">SRD</Badge>
          <Button variant="filled" size="sm" onClick={copyToEditor}>
            <PencilRuler className="mr-2 h-4 w-4" />
            Copy to editor
          </Button>
        </div>
      </div>

      <MonsterStatblock creature={entry.monster} columns />
    </div>
  );
}
