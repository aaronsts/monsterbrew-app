import { createFileRoute } from "@tanstack/react-router";
import CreatureDetail from "@/app/library/components/creature-detail";

export const Route = createFileRoute("/library/$id")({
  // Client-only: the detail view reads IndexedDB and is fully interactive with
  // no SEO value. See the note in routes/editor.tsx.
  ssr: false,
  component: CreatureDetailPage,
});

function CreatureDetailPage() {
  return <CreatureDetail />;
}
