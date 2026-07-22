import { monsterbrewDB } from "./database";
import type { StoredMonster } from "@/schema/monster-schema";

/**
 * Creature repository: the single place that touches the underlying database.
 *
 * Every record is stored in the canonical `Monster` shape (`StoredMonster`) —
 * legacy records are converted once on DB upgrade (see `database.ts`). The rest
 * of the app goes through these functions (via the `use-creatures` query hooks)
 * rather than opening IndexedDB directly, so swapping the storage backend later
 * only means rewriting this file.
 */

export async function getAllCreatures(): Promise<Array<StoredMonster>> {
  const db = await monsterbrewDB();
  try {
    return await db.getAll("creatures");
  } finally {
    db.close();
  }
}

export async function getCreature(
  id: string,
): Promise<StoredMonster | undefined> {
  const db = await monsterbrewDB();
  try {
    return await db.get("creatures", id);
  } finally {
    db.close();
  }
}

export async function saveCreature(
  creature: StoredMonster,
): Promise<StoredMonster> {
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
