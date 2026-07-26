import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ComponentType } from "react";
import { ChapterSidebar } from "@/app/guide/components/chapter-sidebar";
import { CrBenchmarkTable } from "@/app/guide/components/cr-benchmark-table";
import { GuideMarkdown } from "@/app/guide/components/guide-markdown";
import { Button } from "@/components/ui/button";
import { SITE_URL, seo } from "@/lib/seo";

/**
 * Components injected where a chapter's markdown contains a
 * `<!--slot:name-->` marker line. Unknown markers degrade to invisible HTML
 * comments.
 */
const slotComponents: Record<string, ComponentType> = {
  "cr-table": CrBenchmarkTable,
};

export const Route = createFileRoute("/guide/$slug")({
  loader: async ({ params }) => {
    const { getGuideChapter, guideChapterMeta } = await import("@/lib/guide");
    const result = getGuideChapter(params.slug);
    if (!result) throw notFound();
    return { ...result, chapters: guideChapterMeta };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { chapter } = loaderData;
    const path = `/guide/${params.slug}`;
    const { meta, links } = seo({
      title: `${chapter.title} | Monsterbrew Guide`,
      description: chapter.description,
      path,
    });
    return {
      meta,
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Creature Building Guide",
                    item: `${SITE_URL}/guide`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: chapter.title,
                    item: `${SITE_URL}${path}`,
                  },
                ],
              },
              {
                "@type": "Article",
                headline: chapter.title,
                url: `${SITE_URL}${path}`,
                description: chapter.description,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Monsterbrew",
                  url: SITE_URL,
                },
                license:
                  "https://creativecommons.org/licenses/by/4.0/legalcode",
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: ChapterNotFound,
  component: GuideChapterPage,
});

function ChapterNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p>Guide chapter not found.</p>
      <Link to="/guide">
        <Button color="neutral" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to the guide
        </Button>
      </Link>
    </div>
  );
}

function GuideChapterPage() {
  const { chapter, prev, next, chapters } = Route.useLoaderData();
  const chapterNumber = chapter.order + 1;
  const segments = chapter.body.split(/^<!--slot:([a-z-]+)-->$/m);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="flex gap-10 lg:gap-14">
        <ChapterSidebar chapters={chapters} activeSlug={chapter.slug} />

        <article className="min-w-0 flex-1 pb-8">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
            <span aria-hidden className="size-1.5 bg-accent" />
            Chapter {String(chapterNumber).padStart(2, "0")}
          </p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            {chapter.title}
          </h1>

          {segments.map((segment, index) => {
            if (index % 2 === 0) {
              return segment.trim() === "" ? null : (
                <GuideMarkdown key={index}>{segment}</GuideMarkdown>
              );
            }
            const Slot = slotComponents[segment];
            return Slot ? <Slot key={index} /> : null;
          })}

          {/* Prev/next chapter navigation */}
          <nav
            aria-label="Chapter navigation"
            className="mt-10 grid gap-4 border-t border-border pt-6 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                to="/guide/$slug"
                params={{ slug: prev.slug }}
                className="group flex flex-col gap-1 border border-border p-4 transition-colors hover:border-accent"
              >
                <span className="flex items-center gap-1 text-xs tracking-widest text-muted-foreground uppercase">
                  <ArrowLeft className="size-3" />
                  Previous
                </span>
                <span className="font-medium group-hover:text-accent">
                  {prev.shortTitle}
                </span>
              </Link>
            ) : (
              <span aria-hidden />
            )}
            {next ? (
              <Link
                to="/guide/$slug"
                params={{ slug: next.slug }}
                className="group flex flex-col gap-1 border border-border p-4 text-right transition-colors hover:border-accent"
              >
                <span className="flex items-center justify-end gap-1 text-xs tracking-widest text-muted-foreground uppercase">
                  Next
                  <ArrowRight className="size-3" />
                </span>
                <span className="font-medium group-hover:text-accent">
                  {next.shortTitle}
                </span>
              </Link>
            ) : null}
          </nav>

          <p className="mt-6 text-xs text-muted-foreground">
            This guide draws on openly licensed community works — see{" "}
            <Link
              to="/guide/$slug"
              params={{ slug: "sources" }}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Sources and attribution
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
