import { createFileRoute } from "@tanstack/react-router";
import CreatureDetail from "@/app/library/components/creature-detail";

export const Route = createFileRoute("/library/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Creature | Monsterbrew" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreatureDetailPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function CreatureDetailPage() {
  return <CreatureDetail />;
}
