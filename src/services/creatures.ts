import { monsterbrewDB } from "./database";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";
import type { z } from "zod";

/**
 * The canonical stored-creature shape. Everything that talks to the creature
 * store speaks this one type — see `createCreatureSchema`.
 */
export type StoredCreature = z.infer<typeof createCreatureSchema>;

/**
 * Creature repository: the single place that touches the underlying database.
 *
 * The rest of the app goes through these functions (via the `use-creatures`
 * query hooks) rather than opening IndexedDB directly, so swapping the storage
 * backend later only means rewriting this file.
 */

export async function getAllCreatures(): Promise<Array<StoredCreature>> {
  const db = await monsterbrewDB();
  try {
    return await db.getAll("creatures");
  } finally {
    db.close();
  }
}

export async function getCreature(
  id: string,
): Promise<StoredCreature | undefined> {
  const db = await monsterbrewDB();
  try {
    return await db.get("creatures", id);
  } finally {
    db.close();
  }
}

export async function saveCreature(
  creature: StoredCreature,
): Promise<StoredCreature> {
  const db = await monsterbrewDB();
  try {
    await db.put("creatures", creature);
    return creature;
  } finally {
    db.close();
  }
}

export async function deleteCreature(id: string): Promise<void> {
  const db = await monsterbrewDB();
  try {
    await db.delete("creatures", id);
  } finally {
    db.close();
  }
}
