import { createFileRoute } from "@tanstack/react-router";
import LibraryGrid from "@/app/library/components/library-grid";

export const Route = createFileRoute("/library/")({
  // Client-only: the library reads/writes IndexedDB and is fully interactive
  // with no SEO value. See the note in routes/editor.tsx.
  ssr: false,
  component: LibraryPage,
});

function LibraryPage() {
  return <LibraryGrid />;
}
