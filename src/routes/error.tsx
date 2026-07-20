import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: ErrorPage,
});

function ErrorPage() {
  return <p>Sorry, something went wrong</p>;
}
