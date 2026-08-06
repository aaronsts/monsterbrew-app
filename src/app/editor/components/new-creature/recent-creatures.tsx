"use client";

import { useMemo } from "react";
import { History } from "lucide-react";
import { OptionHeading, optionSurface } from "./option";
import { recentCreatures } from "./helpers";
import { useCreatures } from "@/hooks/use-creatures";

/** How many saved creatures the option offers before it starts hiding them. */
const RECENT_LIMIT = 4;

export function RecentCreatures({ onPick }: { onPick: (id: string) => void }) {
  const { data, isPending } = useCreatures();
  const recent = useMemo(
    () => recentCreatures(data ?? [], RECENT_LIMIT),
    [data],
  );

  if (isPending || recent.length === 0) return null;

  return (
    <div className={optionSurface}>
      <OptionHeading icon={History}>Recent</OptionHeading>
      <ul className="flex flex-col gap-1">
        {recent.map((creature) => (
          <li key={creature.id}>
            <button
              type="button"
              onClick={() => onPick(creature.id)}
              className="flex w-full items-baseline justify-between gap-3 px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground hover:**:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:**:text-accent-foreground focus-visible:outline-none"
            >
              <span className="truncate">
                {creature.name || "Unnamed creature"}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                CR {creature.cr.challenge_rating}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
