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

function CreatureDetailPage() {
  return <CreatureDetail />;
}
