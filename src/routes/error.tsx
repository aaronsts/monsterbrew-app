import { createFileRoute } from "@tanstack/react-router";
import { ErrorFallback } from "@/components/error-fallback";

export const Route = createFileRoute("/error")({
  head: () => ({
    meta: [
      { title: "Something went wrong | Monsterbrew" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ErrorPage,
});

function ErrorPage() {
  return <ErrorFallback />;
}
