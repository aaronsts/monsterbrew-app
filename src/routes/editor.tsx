import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MonsterForm } from "@/app/editor/components/monster-form";
import { EditorSkeleton } from "@/app/editor/components/editor-skeleton";
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
  pendingComponent: EditorSkeleton,
  pendingMinMs: 0,
  component: CreatureEditor,
});

function CreatureEditor() {
  // With ssr: false the section anchors don't exist when the browser would
  // natively scroll to the URL hash, so scroll once the form has mounted.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView();
  }, []);

  return (
    <>
      <MonsterForm />
      <FeedbackCta />
    </>
  );
}
