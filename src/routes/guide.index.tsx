import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CornerBrackets } from "@/components/home/corner-brackets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SITE_URL, seo } from "@/lib/seo";

export const Route = createFileRoute("/guide/")({
  loader: async () => {
    const { guideChapterMeta } = await import("@/lib/guide");
    return { chapters: guideChapterMeta };
  },
  head: () => {
    const { meta, links } = seo({
      title: "How to Create a Homebrew Monster for D&D 5e (2024) | Monsterbrew",
      description:
        "A free, practical guide to designing balanced homebrew D&D 5e monsters using the 2024 rules: challenge rating benchmarks, damage budgets, traits that create decisions, and the pitfalls to avoid.",
      path: "/guide",
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
                ],
              },
              {
                "@type": "CollectionPage",
                name: "Monsterbrew Creature Building Guide",
                url: `${SITE_URL}/guide`,
                description:
                  "A chaptered guide to designing balanced, memorable homebrew monsters for D&D 5e 2024.",
                isPartOf: {
                  "@type": "WebSite",
                  name: "Monsterbrew",
                  url: SITE_URL,
                },
              },
            ],
          }),
        },
      ],
    };
  },
  component: GuideIndex,
});

function GuideIndex() {
  const { chapters } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* Header */}
      <section className="relative flex flex-col items-center gap-4 px-4 py-16 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 mask-[radial-gradient(ellipse_60%_70%_at_50%_45%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <CornerBrackets size="size-8" />
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
          <span aria-hidden className="size-1.5 bg-accent" />
          Creature building guide
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          How to create a homebrew monster
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          A practical, 2024 rules guide to designing monsters that are balanced
          on paper, consolidated from the best of the community&rsquo;s design
          knowledge, with full credit to its creators.
        </p>
      </section>

      {/* Chapters */}
      <div className="mt-8 flex flex-col gap-4">
        {chapters.map((chapter, index) => (
          <Link
            key={chapter.slug}
            to="/guide/$slug"
            params={{ slug: chapter.slug }}
            className="group"
          >
            <Card className="relative transition-colors group-hover:border-accent">
              <CardHeader>
                <p className="text-xs font-medium tracking-widest text-accent uppercase">
                  Chapter {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mb-0 flex items-center gap-2 text-xl font-semibold tracking-tight">
                  {chapter.title}
                  <ArrowRight className="size-4 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{chapter.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Cheat sheet */}
      <Link to="/guide/cheat-sheet" className="group mt-4 block">
        <Card className="relative border-dashed transition-colors group-hover:border-accent">
          <CardHeader>
            <p className="text-xs font-medium tracking-widest text-accent uppercase">
              Quick reference
            </p>
            <h2 className="mb-0 flex items-center gap-2 text-xl font-semibold tracking-tight">
              The cheat sheet
              <ArrowRight className="size-4 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The whole guide condensed to one page: roles, formulas, budgets,
              and checks. Handy while building, or at the table.
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Editor CTA */}
      <Card className="relative mt-10">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Put it into practice
          </h2>
          <p className="max-w-xl text-muted-foreground text-balance">
            The editor keeps the math honest while you focus on the concept,
            live statblock preview and attack tokens that recompute as you tune
            your creature.
          </p>
          <Link to="/editor">
            <Button color="accent">
              Open the editor
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
