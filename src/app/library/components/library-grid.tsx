"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Library } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { monsterbrewDB } from "@/services/database";
import { downloadCreatureBackup } from "@/services/backup";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { CR_MAX, CR_VALUES } from "./filters";
import { FilterBar } from "./filter-bar";
import { CreatureCard } from "./creature-card";
import { EmptyState } from "./empty-state";
import { NoMatches } from "./no-matches";

type MonsterbrewCreature = z.infer<typeof createCreatureSchema>;

export default function LibraryGrid() {
  const [myCreatures, setMyCreatures] = useState<MonsterbrewCreature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [crRange, setCrRange] = useState<[number, number]>([0, CR_MAX]);

  async function getLocalCreatures() {
    setIsLoading(true);
    try {
      const db = await monsterbrewDB();
      const creatures = await db.getAll("creatures");
      setMyCreatures(creatures);
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
    getLocalCreatures();
  }, []);

  const backupCreatures = () => {
    toast.promise(downloadCreatureBackup(), {
      loading: "Preparing backup...",
      success: (count) =>
        count === 0
          ? "No creatures to back up yet"
          : `Backed up ${count} creature${count === 1 ? "" : "s"}`,
      error: (err) => `Backup failed: ${err.message}`,
    });
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const [minCr, maxCr] = crRange;
    return myCreatures.filter((creature) => {
      if (query && !(creature.name ?? "").toLowerCase().includes(query)) {
        return false;
      }
      if (
        typeFilter !== "all" &&
        (creature.type ?? "").toLowerCase() !== typeFilter
      ) {
        return false;
      }
      const crIndex = CR_VALUES.indexOf(creature.cr.challenge_rating);
      if (crIndex !== -1 && (crIndex < minCr || crIndex > maxCr)) {
        return false;
      }
      return true;
    });
  }, [myCreatures, search, typeFilter, crRange]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCrRange([0, CR_MAX]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-none ring-2 ring-primary text-primary shadow-sm">
            <Library className="size-8" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-wide ">
              Library
            </h1>
            <p className="text-muted-foreground">
              Manage your locally saved creatures
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={backupCreatures}
          disabled={isLoading || myCreatures.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Download backup
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <p>Loading creatures...</p>
        </div>
      ) : myCreatures.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            crRange={crRange}
            onCrChange={setCrRange}
            resultCount={filtered.length}
            totalCount={myCreatures.length}
          />

          {filtered.length === 0 ? (
            <NoMatches onClear={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((creature) => (
                <CreatureCard key={creature.id} creature={creature} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
