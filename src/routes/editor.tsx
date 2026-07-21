import { createFileRoute } from "@tanstack/react-router";
import { MonsterForm } from "@/app/editor/components/monster-form";

type EditorSearch = {
  id?: string;
};

export const Route = createFileRoute("/editor")({
  // Client-only: the editor is a fully interactive, IndexedDB-backed tool with
  // no SEO value. Rendering it only after hydration avoids a non-interactive
  // SSR flash where inputs exist but react-hook-form/Base UI handlers aren't
  // attached yet.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: CreatureEditor,
});

// eslint-disable-next-line react-refresh/only-export-components
function CreatureEditor() {
  return <MonsterForm />;
}
