"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { monsterbrewDB } from "@/services/database";
import React, { Suspense, useEffect, useState } from "react";
import { StandaloneStatblock } from "@/components/standalone-statblock";
import { toast } from "sonner";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  EllipsisVertical,
  Eye,
  Trash,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge, BadgeVariants } from "@/components/ui/badge";
import { calculateHitPoints } from "@/lib/utils";

type MonsterbrewCreature = z.infer<typeof createCreatureSchema>;

export default function MyCreatures() {
  const id = useSearchParams().get("id");
  const [myCreatures, setMyCreatures] = useState<MonsterbrewCreature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const toggleRowExpansion = (creatureId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [creatureId]: !prev[creatureId],
    }));
  };

  async function getLocalCreatures() {
    setIsLoading(true);
    try {
      const db = await monsterbrewDB();
      const creatures = await db.getAll("creatures");
      setMyCreatures(creatures);
      db.close();
    } catch (err: any) {
      toast.error(`Something went wrong: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getLocalCreatures();
  }, []);

  useEffect(() => {
    if (id) {
      setExpandedRows({ [id]: true });
    }
  }, [id]);

  // Function to load creature into editor
  const loadCreatureIntoEditor = (creature: MonsterbrewCreature) => {
    toast.promise(
      new Promise<void>((resolve) => {
        // Store the creature in localStorage to pass it to the editor
        localStorage.setItem("editCreature", JSON.stringify(creature));
        // Navigate to the editor page
        router.push("/editor");
        resolve();
      }),
      {
        loading: `Loading ${creature.name} into editor...`,
        success: `${creature.name} ready for editing`,
        error: "Failed to load creature",
      }
    );
  };

  // Function to duplicate a creature and open it in the editor
  const duplicateCreature = (creature: MonsterbrewCreature) => {
    const creatureCopy = { ...creature };
    delete creatureCopy.id;

    creatureCopy.name = `Copy of ${creature.name}`;

    localStorage.setItem("editCreature", JSON.stringify(creatureCopy));

    router.push("/editor");
  };

  // Function to delete a creature
  const deleteCreature = (creature: MonsterbrewCreature) => {
    toast.promise(
      (async () => {
        const db = await monsterbrewDB();
        try {
          if (!creature.id) {
            throw new Error("Could not find creature to delete");
          }
          await db.delete("creatures", creature.id);
          // Refresh the creatures list
          await getLocalCreatures();
          return creature.name; // Return name for success message
        } finally {
          db.close();
        }
      })(),
      {
        loading: `Deleting ${creature.name}...`,
        success: (name) => `${name} deleted successfully`,
        error: (err) => `Error deleting creature: ${err.message}`,
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Creatures</CardTitle>
        <CardDescription>Manage your locally saved creatures</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading creatures...</p>
          </div>
        ) : myCreatures.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p>No creatures found. Create a new creature to get started!</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your locally saved creatures</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>CR</TableHead>
                <TableHead>HP</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myCreatures.map((creature) => {
                const creatureId = creature.id || "";
                const isExpanded = expandedRows[creatureId];

                const medianHP = calculateHitPoints(
                  creature.hit_dice,
                  creature.size,
                  creature.ability_scores.con
                );

                const hp =
                  creature.custom_hp ||
                  medianHP ||
                  creature.hit_points.toString();

                return (
                  <React.Fragment key={creatureId}>
                    <TableRow
                      className="border-b"
                      onClick={() => toggleRowExpansion(creatureId)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="transparant"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(creatureId);
                            }}
                            className="h-6 w-6"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          {creature.name || "Unknown Creature"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            creature.type.toLocaleLowerCase() as keyof BadgeVariants["variant"]
                          }
                        >
                          {creature.type || "not selected"}
                        </Badge>
                      </TableCell>
                      <TableCell>{creature.size || "not selected"}</TableCell>
                      <TableCell>{creature.cr.challenge_rating}</TableCell>
                      <TableCell className="w-24">{hp}</TableCell>
                      <TableCell
                        className="text-right w-fit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="transparant"
                              color="carrara"
                              size="icon-sm"
                            >
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => loadCreatureIntoEditor(creature)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit in Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleRowExpansion(creatureId)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {isExpanded ? "Hide Details" : "View Details"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => duplicateCreature(creature)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteCreature(creature)}
                              className="text-destructive"
                            >
                              <Trash className="text-destructive mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {/* Collapsible statblock row */}
                    {isExpanded && (
                      <TableRow className="bg-muted/50 hover:bg-muted/50 cursor-default">
                        <TableCell
                          colSpan={6}
                          className="p-0 animate-in fade-in-10 duration-300"
                        >
                          <div className="p-4">
                            <StandaloneStatblock creature={creature} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
