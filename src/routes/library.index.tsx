import { createFileRoute } from "@tanstack/react-router";
import LibraryGrid from "@/app/library/components/library-grid";

type LibrarySource = "mine" | "srd";

export const Route = createFileRoute("/library/")({
  // Client-only: the library reads/writes IndexedDB and is fully interactive
  // with no SEO value. See the note in routes/editor.tsx.
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): { source?: LibrarySource } =>
    search.source === "srd" ? { source: "srd" } : {},
  component: LibraryPage,
});

function LibraryPage() {
  const { source } = Route.useSearch();
  return <LibraryGrid source={source} />;
}
