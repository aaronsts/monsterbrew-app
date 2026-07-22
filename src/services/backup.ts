import type { StoredCreature } from "@/services/creatures";
import { getAllCreatures } from "@/services/creatures";

/** Envelope written to disk so backups are self-describing and future-proof. */
export interface CreatureBackup {
  app: "monsterbrew";
  type: "creature-backup";
  version: number;
  exportedAt: string;
  count: number;
  creatures: Array<StoredCreature>;
}

export const BACKUP_VERSION = 1;

/** Build the backup envelope from the current IndexedDB contents. */
export async function buildCreatureBackup(): Promise<CreatureBackup> {
  const creatures = await getAllCreatures();
  return {
    app: "monsterbrew",
    type: "creature-backup",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    count: creatures.length,
    creatures,
  };
}

/** Trigger a browser download of the given text as a file. */
function downloadFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export all saved creatures to a JSON file on the user's computer.
 * Returns the number of creatures backed up.
 */
export async function downloadCreatureBackup(): Promise<number> {
  const backup = await buildCreatureBackup();
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(
    `monsterbrew-backup-${stamp}.json`,
    JSON.stringify(backup, null, 2),
    "application/json",
  );
  return backup.count;
}
