import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCreature,
  getAllCreatures,
  getCreature,
  saveCreature,
} from "@/services/creatures";

/**
 * TanStack Query hooks for the creature store. Components use these instead of
 * touching the database directly, which keeps caching/invalidation in one place
 * and lets us swap the storage backend by only rewriting `services/creatures`.
 *
 * The store is typed as `StoredMonster`, so these hooks return that shape
 * directly — no per-call storage-shape bridging is needed.
 */

/** Query-key factory so lists and details invalidate consistently. */
export const creatureKeys = {
  all: ["creatures"] as const,
  lists: () => [...creatureKeys.all, "list"] as const,
  details: () => [...creatureKeys.all, "detail"] as const,
  detail: (id: string) => [...creatureKeys.details(), id] as const,
};

/** All locally saved creatures. */
export function useCreatures() {
  return useQuery({
    queryKey: creatureKeys.lists(),
    queryFn: getAllCreatures,
  });
}

/**
 * A single creature by id. Disabled (no fetch) while `id` is undefined.
 *
 * IndexedDB is the single source of truth and the editor is the only writer, so
 * we never want a stale/focus refetch to overwrite the open form (see #93). Our
 * own mutations refresh this cache explicitly, so `staleTime: Infinity` +
 * `refetchOnWindowFocus: false` is safe here.
 */
export function useCreature(id: string | undefined) {
  return useQuery({
    queryKey: creatureKeys.detail(id ?? ""),
    queryFn: () => getCreature(id!),
    enabled: Boolean(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/** Insert or update a creature, refreshing the affected list/detail queries. */
export function useSaveCreature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCreature,
    onSuccess: (creature) => {
      queryClient.invalidateQueries({ queryKey: creatureKeys.lists() });
      if (creature.id) {
        queryClient.invalidateQueries({
          queryKey: creatureKeys.detail(creature.id),
        });
      }
    },
  });
}

/**
 * Auto-save variant of {@link useSaveCreature}. Unlike the manual save (which
 * invalidates the detail query and navigates away), this writes the saved record
 * straight into the detail cache with `setQueryData` so the open form is **not**
 * resynced/re-rendered by a background refetch. The list is still invalidated so
 * the library grid stays current.
 */
export function useAutoSaveCreature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCreature,
    onSuccess: (creature) => {
      if (creature.id) {
        queryClient.setQueryData(creatureKeys.detail(creature.id), creature);
      }
      queryClient.invalidateQueries({ queryKey: creatureKeys.lists() });
    },
  });
}

/** Delete a creature, dropping it from the list and detail caches. */
export function useDeleteCreature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCreature,
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: creatureKeys.lists() });
      queryClient.removeQueries({ queryKey: creatureKeys.detail(id) });
    },
  });
}
