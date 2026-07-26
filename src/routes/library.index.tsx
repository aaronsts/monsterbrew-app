import { createFileRoute } from "@tanstack/react-router";
import LibraryGrid from "@/app/library/components/library-grid";
import { seo } from "@/lib/seo";

type LibrarySource = "mine" | "srd";

export const Route = createFileRoute("/library/")({
  ssr: false,
  head: () => ({
    ...seo({
      title: "Monster Library | Monsterbrew",
      description:
        "Browse your saved homebrew creatures and the full D&D 2024 SRD bestiary: over 300 monsters with complete 5e statblocks, ready to copy into the editor.",
      path: "/library",
    }),
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): { source?: LibrarySource } =>
    search.source === "srd" ? { source: "srd" } : {},
  component: LibraryPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function LibraryPage() {
  const { source } = Route.useSearch();
  return <LibraryGrid source={source} />;
}
