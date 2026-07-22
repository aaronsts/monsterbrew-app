import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoredCreature } from "@/services/creatures";
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
 */

/** Query-key factory so lists and details invalidate consistently. */
export const creatureKeys = {
  all: ["creatures"] as const,
  lists: () => [...creatureKeys.all, "list"] as const,
  details: () => [...creatureKeys.all, "detail"] as const,
  detail: (id: string) => [...creatureKeys.details(), id] as const,
};

// The store is loosely typed for the legacy creature shape (`StoredCreature`).
// Callers that work in a newer shape (e.g. `Monster`) request it via the
// `TCreature` type parameter, keeping the one storage-shape bridge here in the
// data-access layer instead of an `as unknown as` at every call site.

/** All locally saved creatures. */
export function useCreatures<TCreature = StoredCreature>() {
  return useQuery({
    queryKey: creatureKeys.lists(),
    queryFn: () => getAllCreatures() as unknown as Promise<Array<TCreature>>,
  });
}

/** A single creature by id. Disabled (no fetch) while `id` is undefined. */
export function useCreature<TCreature = StoredCreature>(
  id: string | undefined,
) {
  return useQuery({
    queryKey: creatureKeys.detail(id ?? ""),
    queryFn: () => getCreature(id!) as unknown as Promise<TCreature | undefined>,
    enabled: Boolean(id),
  });
}

/** Insert or update a creature, refreshing the affected list/detail queries. */
export function useSaveCreature<TCreature = StoredCreature>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creature: TCreature) =>
      saveCreature(creature as unknown as StoredCreature),
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
