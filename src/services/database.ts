import { openDB } from "idb";
import type { DBSchema } from "idb";
import type { StoredMonster } from "@/schema/monster-schema";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";
import type { z } from "zod";
import { isLegacyCreature } from "@/services/migrations/creatureFormat";
import { creatureToMonster } from "@/services/migrations/creatureToMonster";

type LegacyCreature = z.infer<typeof createCreatureSchema>;

interface MonsterbrewDB extends DBSchema {
  creatures: {
    key: string;
    value: StoredMonster;
  };
}

const DB_VERSION = 2;

export const monsterbrewDB = async () => {
  return await openDB<MonsterbrewDB>("monsterbrewDB", DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      // v0 -> v1: create the store.
      if (oldVersion < 1) {
        db.createObjectStore("creatures", { keyPath: "id" });
      }

      // v1 -> v2: convert every legacy-shaped record to the `Monster` shape
      // once, in place. Guarded by `isLegacyCreature` so it is idempotent and
      // safe to run over a store that already holds `Monster` records.
      if (oldVersion < 2) {
        const store = tx.objectStore("creatures");
        let cursor = await store.openCursor();
        while (cursor) {
          if (isLegacyCreature(cursor.value)) {
            await cursor.update(
              creatureToMonster(cursor.value as unknown as LegacyCreature),
            );
          }
          cursor = await cursor.continue();
        }
      }
    },
  });
};
