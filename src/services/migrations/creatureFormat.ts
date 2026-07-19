export type CreatureFormat = "legacy" | "monster";

export function getCreatureFormat(record: unknown): CreatureFormat {
  return Array.isArray((record as { saving_throws?: unknown })?.saving_throws)
    ? "legacy"
    : "monster";
}

export function isLegacyCreature(record: unknown): boolean {
  return getCreatureFormat(record) === "legacy";
}
