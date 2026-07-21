import { fromImprovedInitiative } from "./from-improved-initiative";
import { fromTetraCube } from "./from-tetra-cube";
import { fromOpen5e } from "./from-open-5e";
import { from5eTools } from "./from-5e-tools";
import type { ImportFormat } from "./detect-import-format";
import type { Monster } from "@/schema/monster-schema";

/** Route parsed JSON to the matching format converter. */
export function convertImport(format: ImportFormat, data: unknown): Monster {
  switch (format) {
    case "improved-initiative":
      return fromImprovedInitiative(data);
    case "tetra-cube":
      return fromTetraCube(data);
    case "open-5e":
      return fromOpen5e(data);
    case "5e-tools":
      return from5eTools(data);
  }
}
