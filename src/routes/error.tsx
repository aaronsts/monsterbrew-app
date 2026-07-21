import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: ErrorPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function ErrorPage() {
  return <p>Sorry, something went wrong</p>;
}
