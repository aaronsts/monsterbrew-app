import { createFileRoute } from "@tanstack/react-router";
import SrdDetail from "@/app/library/components/srd-detail";

export const Route = createFileRoute("/library/srd/$key")({
  // Client-only: the detail view is fully interactive with no SEO value.
  // See the note in routes/editor.tsx.
  ssr: false,
  component: SrdDetailPage,
});

function SrdDetailPage() {
  return <SrdDetail />;
}
