import { createFileRoute } from "@tanstack/react-router";
import CreatureDetail from "@/app/library/components/creature-detail";
import { CreatureDetailSkeleton } from "@/app/library/components/creature-detail-skeleton";

export const Route = createFileRoute("/library/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Creature | Monsterbrew" },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingComponent: CreatureDetailSkeleton,
  pendingMinMs: 0,
  component: CreatureDetailPage,
});

function CreatureDetailPage() {
  return <CreatureDetail />;
}
