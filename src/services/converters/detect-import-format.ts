export type ImportFormat =
  | "improved-initiative"
  | "tetra-cube"
  | "open-5e"
  | "5e-tools";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function detectImportFormat(data: unknown): ImportFormat | null {
  if (!isRecord(data)) return null;

  // Improved Initiative: PascalCase ability block plus HP/AC objects.
  if (isRecord(data.Abilities) && isRecord(data.HP) && isRecord(data.AC)) {
    return "improved-initiative";
  }

  // TetraCube: per-ability point fields and its own HP text field.
  if ("strPoints" in data && "hpText" in data) {
    return "tetra-cube";
  }

  // 5eTools: size is an array and there's a `source` book reference.
  if (Array.isArray(data.size) && "source" in data) {
    return "5e-tools";
  }

  // Open5e: full-word ability keys on the root object.
  if ("strength" in data && "dexterity" in data) {
    return "open-5e";
  }

  return null;
}

export const IMPORT_FORMAT_LABELS: Record<ImportFormat, string> = {
  "improved-initiative": "Improved Initiative",
  "tetra-cube": "TetraCube",
  "open-5e": "Open5e",
  "5e-tools": "5eTools",
};
