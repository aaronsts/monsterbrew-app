import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { FieldArrayWithId } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";

interface FieldArrayButtonsProps {
  index: number;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  remove: (index: number) => void;
  fields: FieldArrayWithId<
    z.infer<typeof createCreatureSchema>,
    "traits" | "actions" | "reactions" | "legendary_actions",
    "id"
  >[];
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
        variant="transparant"
        color="carrara"
        size="icon"
      >
        ↑
      </Button>
      <Button
        type="button"
        onClick={() => moveDown(index)}
        disabled={index === fields.length - 1}
        className="disabled:opacity-20"
        variant="transparant"
        color="carrara"
        size="icon"
      >
        ↓
      </Button>
      <Button
        type="button"
        variant="transparant"
        color="destructive"
        size="icon"
        onClick={() => remove(index)}
      >
        <span className="sr-only">Remove Feature</span>
        <Trash2 />
      </Button>
    </div>
  );
}
