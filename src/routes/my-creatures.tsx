import { createFileRoute } from "@tanstack/react-router";
import MyCreatures from "@/app/my-creatures/components/my-creatures";

type MyCreaturesSearch = {
  id?: string;
};

export const Route = createFileRoute("/my-creatures")({
  validateSearch: (search: Record<string, unknown>): MyCreaturesSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: MyCreaturesPage,
});

function MyCreaturesPage() {
  return <MyCreatures />;
}
