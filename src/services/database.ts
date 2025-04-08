import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { DBSchema, openDB } from "idb";
import { z } from "zod";

type MonsterbrewCreature = z.infer<typeof createCreatureSchema>;

interface MonsterbrewDB extends DBSchema {
  creatures: {
    key: string;
    value: MonsterbrewCreature;
  };
}

export const monsterbrewDB = async () => {
  return await openDB<MonsterbrewDB>("monsterbrewDB", 1, {
    upgrade: (db, oldVersion) => {
      switch (oldVersion) {
        case 0:
          upgradeDB3fromV0toV1();
        // falls through
        case 1:
          break;
        default:
          console.error("unknown db version");
      }

      function upgradeDB3fromV0toV1() {
        db.createObjectStore("creatures", { keyPath: "id" });
      }
    },
  });
};
