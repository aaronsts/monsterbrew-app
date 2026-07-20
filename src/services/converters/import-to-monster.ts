import { Monster } from "@/schema/monster-schema";
import { Open5eCreature } from "@/types/open5e";
import { TetraCubeCreature } from "@/types/tetraCube";
import { ImportFormat } from "./detect-import-format";
import { fromImprovedInitiative } from "./from-improved-initiative";
import { fromTetraCube } from "./from-tetra-cube";
import { fromOpen5e } from "./from-open-5e";
import { from5eTools } from "./from-5e-tools";

/** Route parsed JSON to the matching format converter. */
export function convertImport(format: ImportFormat, data: unknown): Monster {
  switch (format) {
    case "improved-initiative":
      return fromImprovedInitiative(data as typeof ImprovedInitiativeCreature);
    case "tetra-cube":
      return fromTetraCube(data as TetraCubeCreature);
    case "open-5e":
      return fromOpen5e(data as Open5eCreature);
    case "5e-tools":
      return from5eTools(data);
  }
}
