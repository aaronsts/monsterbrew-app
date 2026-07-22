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

/** A single creature by id. Disabled (no fetch) while `id` is undefined. */
export function useCreature(id: string | undefined) {
  return useQuery({
    queryKey: creatureKeys.detail(id ?? ""),
    queryFn: () => getCreature(id!),
    enabled: Boolean(id),
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
