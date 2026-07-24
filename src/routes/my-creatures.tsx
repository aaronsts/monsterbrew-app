import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-creatures")({
  beforeLoad: () => {
    throw redirect({ to: "/library", replace: true });
  },
});
