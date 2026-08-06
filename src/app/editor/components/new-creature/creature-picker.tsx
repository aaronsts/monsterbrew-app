"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import {
  NO_CREATURE_FILTERS,
  filterCreatureEntries,
  hasActiveCreatureFilters,
  mergeCreatureEntries,
  starterFromEntry,
} from "./helpers";
import type { CreatureEntry, CreatureFilters } from "./helpers";
import type { Monster } from "@/schema/monster-schema";
import type { FilterOption } from "@/lib/constants/filter-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatures } from "@/hooks/use-creatures";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CR_OPTIONS,
  SIZE_OPTIONS,
  SOURCE_OPTIONS,
  TYPE_OPTIONS,
  creatureTypeVariant,
} from "@/lib/constants/filter-options";
import { Badge } from "@/components/ui/badge";

interface CreaturePickerProps {
  onPick: (monster: Monster) => void;
  onBack: () => void;
}

/**
 * Search everything you could build on — your own saved creatures and the 2024
 * SRD bestiary — and load one into the editor, without the trip through
 * `/library?source=srd`.
 *
 * Picking always produces a fresh, **unsaved** copy, including for your own
 * creatures: saving makes a second creature and leaves the original alone. The
 * `RecentCreatures` card is the one that opens a creature for editing in place.
 *
 * `src/data/srd-monsters.json` is ~660 KB and is deliberately code-split so it
 * only loads on the library route. Pulling it in with a **dynamic** import
 * keeps it out of the editor's initial load — it arrives when this option is
 * opened and not before. Nothing else in this file imports `@/services/srd`,
 * not even a type (see `CreatureEntry`), so there is no static edge to follow.
 */
export function CreaturePicker({
  onPick,
  onBack,
}: Readonly<CreaturePickerProps>) {
  const [srdEntries, setSrdEntries] = useState<Array<{
    key: string;
    monster: Monster;
  }> | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<CreatureFilters>(NO_CREATURE_FILTERS);
  const { data: saved, isPending: savedPending } = useCreatures();

  useEffect(() => {
    let cancelled = false;
    import("@/services/srd")
      .then((srd) => {
        if (!cancelled) setSrdEntries(srd.getSrdMonsters());
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const entries = useMemo(
    () =>
      srdEntries && !savedPending
        ? mergeCreatureEntries(saved ?? [], srdEntries)
        : null,
    [srdEntries, saved, savedPending],
  );

  const filtered = useMemo(
    () => (entries ? filterCreatureEntries(entries, filters) : []),
    [entries, filters],
  );

  const setFilter = (patch: Partial<CreatureFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const filtering = hasActiveCreatureFilters(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <Button
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        {filtering && (
          <Button
            type="button"
            color="destructive"
            variant="ghost"
            size="sm"
            onClick={() => setFilters(NO_CREATURE_FILTERS)}
          >
            Clear filters
          </Button>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted-foreground">
            The bestiary didn&apos;t load.
          </p>
          <Button
            type="button"
            color="neutral"
            variant="outline"
            size="sm"
            onClick={() => {
              setError(false);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={filters.search}
              onChange={(event) => setFilter({ search: event.target.value })}
              aria-label="Search creatures"
              placeholder="Search by name…"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <FilterSelect
              label="Source"
              options={SOURCE_OPTIONS}
              value={filters.source}
              onChange={(source) => setFilter({ source })}
            />
            <FilterSelect
              label="Size"
              options={SIZE_OPTIONS}
              value={filters.size}
              onChange={(size) => setFilter({ size })}
            />
            <FilterSelect
              label="Type"
              options={TYPE_OPTIONS}
              value={filters.type}
              onChange={(type) => setFilter({ type })}
            />
            <FilterSelect
              label="Challenge rating"
              options={CR_OPTIONS}
              value={filters.cr}
              onChange={(cr) => setFilter({ cr })}
            />
          </div>

          {!entries ? (
            <CreatureListSkeleton />
          ) : (
            <CreatureList filtered={filtered} onPick={onPick} />
          )}

          <div className="flex h-6 items-center justify-between gap-3">
            {!entries ? (
              <Skeleton className="h-3 w-28" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {filtering
                  ? `${filtered.length} of ${entries.length} creatures`
                  : `${entries.length} creatures`}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface CreatureListProps {
  filtered: Array<CreatureEntry>;
  onPick: (monster: Monster) => void;
}

function CreatureList({ filtered, onPick }: CreatureListProps) {
  return filtered.length === 0 ? (
    <p className="flex h-80 items-center justify-center text-sm text-muted-foreground">
      No creatures match these filters.
    </p>
  ) : (
    <ul className="h-80 divide-y divide-foreground/10 overflow-y-auto ring-1 ring-foreground/10">
      {filtered.map((entry) => (
        <li key={entry.key}>
          <button
            type="button"
            onClick={() => onPick(starterFromEntry(entry))}
            className="grid grid-cols-5 w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground hover:**:text-accent-foreground focus-visible:bg-accent **:transition-none focus-visible:text-accent-foreground focus-visible:**:text-accent-foreground focus-visible:outline-none"
          >
            <span className="col-span-2 flex items-baseline gap-2 truncate">
              <span className="truncate">{entry.monster.name}</span>
              {entry.source === "personal" && (
                <span className="shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase">
                  Personal
                </span>
              )}
            </span>
            <Badge variant={creatureTypeVariant(entry.monster.type)}>
              {entry.monster.type}
            </Badge>
            <span className="shrink-0 text-xs text-muted-foreground">
              CR {entry.monster.cr.challenge_rating}
            </span>
            <span className="shrink-0 text-xs capitalize text-muted-foreground">
              {entry.monster.size}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CreatureListSkeleton() {
  return (
    <div
      data-testid="creature-list-skeleton"
      aria-hidden="true"
      className="flex h-80 flex-col divide-y divide-foreground/10 overflow-hidden ring-1 ring-foreground/10"
    >
      {Array.from({ length: 9 }, (_, row) => (
        <div
          key={row}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: Readonly<{
  label: string;
  options: Array<FilterOption>;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => onChange(next as string)}
    >
      <SelectTrigger aria-label={label} className="mb-0 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
