import { creatureToMonster } from "./creatureToMonster";
import type { ZodError } from "zod";
import type { StoredMonster } from "./creatureToMonster";
import { createCreatureSchema } from "@/schema/createCreatureSchema";

export type MigrateResult =
  | { status: "ok"; creature: StoredMonster }
  | { status: "error"; reason: string };

function formatIssues(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function migrateCreature(record: unknown): MigrateResult {
  const parsed = createCreatureSchema.safeParse(record);
  if (!parsed.success) {
    return { status: "error", reason: formatIssues(parsed.error) };
  }

  try {
    return { status: "ok", creature: creatureToMonster(parsed.data) };
  } catch (err) {
    return {
      status: "error",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
