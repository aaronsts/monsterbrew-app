"use client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Library } from "lucide-react";
import { FilterBar } from "./filter-bar";
import { CreatureCard } from "./creature-card";
import { EmptyState } from "./empty-state";
import { NoMatches } from "./no-matches";

import type { Monster } from "@/schema/monster-schema";
import { Button } from "@/components/ui/button";
import { useCreatures } from "@/hooks/use-creatures";
import { downloadCreatureBackup } from "@/services/backup";
import { getSrdMonsters } from "@/services/srd";

type LibrarySource = "mine" | "srd";

/** Saved creatures always carry an `id`; SRD entries are keyed by `srdKey`. */
type LibraryCreature = Monster & { id?: string };

interface LibraryItem {
  creature: LibraryCreature;
  srdKey?: string;
}

export default function LibraryGrid({
  source = "mine",
}: {
  source?: LibrarySource;
}) {
  const navigate = useNavigate();
  const {
    data: myCreatures = [],
    isPending: isLoading,
    error,
  } = useCreatures();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [crFilter, setCrFilter] = useState<Array<string>>([]);

  useEffect(() => {
    if (error) {
      toast.error(
        `Something went wrong: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [error]);

  const setSource = (next: LibrarySource) => {
    if (next === source) return;
    navigate({ to: "/library", search: { source: next } });
  };

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

  // SRD monsters are static; convert once and reuse.
  const srdItems = useMemo<Array<LibraryItem>>(
    () =>
      getSrdMonsters().map((entry) => ({
        creature: entry.monster,
        srdKey: entry.key,
      })),
    [],
  );

  const items = useMemo<Array<LibraryItem>>(
    () =>
      source === "srd"
        ? srdItems
        : myCreatures.map((creature) => ({ creature })),
    [source, srdItems, myCreatures],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(({ creature }) => {
      if (query && !(creature.name ?? "").toLowerCase().includes(query)) {
        return false;
      }
      if (
        typeFilter !== "all" &&
        (creature.type ?? "").toLowerCase() !== typeFilter
      ) {
        return false;
      }
      if (
        crFilter.length > 0 &&
        !crFilter.includes(creature.cr.challenge_rating)
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, typeFilter, crFilter]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCrFilter([]);
  };

  const isSrd = source === "srd";
  const loading = isSrd ? false : isLoading;

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
              {isSrd
                ? "Browse the D&D 2024 SRD monsters"
                : "Manage your locally saved creatures"}
            </p>
          </div>
        </div>
        {!isSrd && (
          <Button
            color="neutral" variant="outline"
            size="sm"
            onClick={backupCreatures}
            disabled={isLoading || myCreatures.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download backup
          </Button>
        )}
      </div>

      <div className="inline-flex self-start ring-1 ring-foreground/15">
        <Button
          color={isSrd ? "neutral" : "primary"}
          variant={isSrd ? "ghost" : "filled"}
          size="sm"
          className="rounded-none"
          onClick={() => setSource("mine")}
        >
          My creatures
        </Button>
        <Button
          color={isSrd ? "primary" : "neutral"}
          variant={isSrd ? "filled" : "ghost"}
          size="sm"
          className="rounded-none"
          onClick={() => setSource("srd")}
        >
          SRD monsters
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <p>Loading creatures...</p>
        </div>
      ) : !isSrd && myCreatures.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            cr={crFilter}
            onCrChange={setCrFilter}
            resultCount={filtered.length}
            totalCount={items.length}
          />

          {filtered.length === 0 ? (
            <NoMatches onClear={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(({ creature, srdKey }) => (
                <CreatureCard
                  key={srdKey ?? creature.id}
                  creature={creature}
                  srdKey={srdKey}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
