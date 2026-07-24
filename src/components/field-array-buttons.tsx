import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import type { FieldArrayWithId } from "react-hook-form";
import type { z } from "zod";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";

interface FieldArrayButtonsProps {
  index: number;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  remove: (index: number) => void;
  fields: Array<FieldArrayWithId<
    z.infer<typeof createCreatureSchema>,
    "traits" | "actions" | "reactions" | "legendary_actions",
    "id"
  >>;
}

export function FieldArrayButtons({
  index,
  moveUp,
  moveDown,
  remove,
  fields,
}: FieldArrayButtonsProps) {
  return (
    <div className="flex gap-1 items-centers">
      <Button
        type="button"
        onClick={() => moveUp(index)}
        disabled={index === 0}
        className="disabled:opacity-20"
        color="neutral" variant="transparent"
        size="icon"
      >
        ↑
      </Button>
      <Button
        type="button"
        onClick={() => moveDown(index)}
        disabled={index === fields.length - 1}
        className="disabled:opacity-20"
        color="neutral" variant="transparent"
        size="icon"
      >
        ↓
      </Button>
      <Button
        type="button"
        color="neutral" variant="transparent"
        size="icon"
        className="hover:text-destructive"
        onClick={() => remove(index)}
      >
        <span className="sr-only">Remove Feature</span>
        <Trash2 />
      </Button>
    </div>
  );
}
