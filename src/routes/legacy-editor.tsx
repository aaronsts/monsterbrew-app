import { createFileRoute } from "@tanstack/react-router";
import Editor from "@/app/legacy-editor/components/editor";

type LegacyEditorSearch = {
  id?: string;
};

export const Route = createFileRoute("/legacy-editor")({
  // Client-only: the legacy editor relies on react-to-print (a browser-only
  // print library that cannot server-render) and IndexedDB. No SEO value.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LegacyEditorSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: LegacyCreatureEditor,
});

// eslint-disable-next-line react-refresh/only-export-components
function LegacyCreatureEditor() {
  return <Editor />;
}
