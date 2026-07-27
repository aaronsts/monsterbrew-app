import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function Section({
  title,
  slug,
  children,
}: {
  title: string;
  slug: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Link
          to="/guide/$slug"
          params={{ slug }}
          className="flex items-center gap-1 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-accent"
        >
          Full chapter
          <ArrowRight className="size-3" />
        </Link>
      </div>
      {children}
    </section>
  );
}
