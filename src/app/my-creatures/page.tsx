"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { monsterbrewDB } from "@/services/database";
import { Suspense, useEffect, useState } from "react";
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
import { Edit, EllipsisVertical, Eye, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MonsterbrewCreature = z.infer<typeof createCreatureSchema>;

export default function MyCreaturesPage() {
  const [myCreatures, setMyCreatures] = useState<MonsterbrewCreature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
    <Suspense>
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
              <TableCaption>
                A list of your locally saved creatures
              </TableCaption>
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
                {myCreatures.map((creature) => (
                  <TableRow key={creature.id}>
                    <TableCell className="font-medium">
                      {creature.name || "Unknown Creature"}
                    </TableCell>
                    <TableCell>{creature.type}</TableCell>
                    <TableCell>{creature.size}</TableCell>
                    <TableCell>{creature.cr.challenge_rating}</TableCell>
                    <TableCell>{creature.hit_points}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteCreature(creature)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Suspense>
  );
}
