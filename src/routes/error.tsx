import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  head: () => ({
    meta: [
      { title: "Something went wrong | Monsterbrew" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ErrorPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function ErrorPage() {
  return <p>Sorry, something went wrong</p>;
}
