import { createFileRoute } from "@tanstack/react-router";
import { MonsterForm } from "@/app/editor/components/monster-form";

type EditorSearch = {
  id?: string;
};

export const Route = createFileRoute("/editor")({
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: CreatureEditor,
});

function CreatureEditor() {
  return <MonsterForm />;
}
