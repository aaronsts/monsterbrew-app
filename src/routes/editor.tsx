import { createFileRoute } from "@tanstack/react-router";
import { MonsterForm } from "@/app/editor/components/monster-form";
import { FeedbackCta } from "@/components/feedback-cta";
import { seo } from "@/lib/seo";

type EditorSearch = {
  id?: string;
};

export const Route = createFileRoute("/editor")({
  ssr: false,
  head: () => ({
    ...seo({
      title: "Statblock Editor | Monsterbrew",
      description:
        "Build a D&D 5e monster statblock in minutes. Live preview, automatic modifiers and saving throws, and export to Homebrewery, Improved Initiative, or PDF.",
      path: "/editor",
    }),
  }),
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: CreatureEditor,
});

// eslint-disable-next-line react-refresh/only-export-components
function CreatureEditor() {
  return (
    <>
      <MonsterForm />
      <FeedbackCta />
    </>
  );
}
