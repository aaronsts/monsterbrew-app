import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, FileText, HardDriveDownload, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/home/feature-card";
import { CornerBrackets } from "@/components/home/corner-brackets";
import { SITE_URL, seo } from "@/lib/seo";

const faq = [
  {
    question: "What is Monsterbrew?",
    answer:
      "Monsterbrew is a free, browser-based monster statblock builder for D&D 5e. You enter a creature's abilities and stats, and it produces a complete, correctly formatted 5e statblock with modifiers, saving throws, and hit points calculated for you.",
  },
  {
    question: "Is Monsterbrew free to use?",
    answer:
      "Yes. Monsterbrew is completely free and requires no account or sign-up. Your creatures are saved locally in your browser.",
  },
  {
    question: "Can I import monsters from other tools?",
    answer:
      "Yes. Monsterbrew imports statblocks from Improved Initiative, TetraCube, Open5e, and 5eTools, and exports to Homebrewery V3 markdown, Improved Initiative JSON, and PDF.",
  },
  {
    question: "Does Monsterbrew include official D&D monsters?",
    answer:
      "Yes. The library includes the full D&D 2024 SRD bestiary: over 300 monsters you can browse and copy into the editor as a starting point for your own homebrew creatures. The SRD is published by Wizards of the Coast under the Creative Commons Attribution 4.0 license.",
  },
];

const guideChapters = [
  "Fundamentals of monster design",
  "Challenge rating in practice",
  "Offense and defense budgets",
  "Traits, actions, and flavor",
  "Common pitfalls",
  "Playtesting and iteration",
];

export const Route = createFileRoute("/")({
  head: () => {
    const { meta, links } = seo({
      title: "Monsterbrew | D&D 5e Monster Creator & Homebrew Tool",
      description:
        "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew | a free, intuitive homebrew tool for Dungeon Masters. Design unique encounters for your tabletop RPG campaigns!",
      path: "/",
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
                "@type": "WebApplication",
                name: "Monsterbrew",
                url: SITE_URL,
                description:
                  "A free D&D 5e monster statblock builder for Dungeon Masters. Create, import, and export homebrew creatures.",
                applicationCategory: "UtilityApplication",
                operatingSystem: "Any",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: faq.map(({ question, answer }) => ({
                  "@type": "Question",
                  name: question,
                  acceptedAnswer: { "@type": "Answer", text: answer },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  return (
    <div className="w-full flex flex-col gap-24 py-8 px-6">
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-6 px-4 py-20 text-center sm:px-8 sm:py-28">
        {/* Masked grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 mask-[radial-gradient(ellipse_60%_70%_at_50%_45%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Build D&D 5e statblocks
          <br />
          <span className="text-accent">the easy way</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          Monsterbrew is a free, intuitive monster maker and statblock generator
          for D&D 5e. Start from scratch or drop a statblock ready to customize
          into the editor.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link to="/editor">
            <Button size="lg" color="accent" variant="filled">
              Start Brewing <ArrowRight />
            </Button>
          </Link>
          <Link to="/library">
            <Button size="lg" color="neutral" variant="outline">
              View Library
            </Button>
          </Link>
        </div>
      </section>

      {/* What is Monsterbrew */}
      <section
        className="relative overflow-hidden bg-primary dark:bg-card ring-1 ring-foreground/10"
        style={{ color: "color-mix(in srgb, var(--bg-base) 96%, white 4%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mask-[radial-gradient(ellipse_75%_75%_at_50%_50%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 py-14 sm:px-12">
          <p className="mb-8 flex items-center gap-2 text-xs font-medium tracking-widest text-primary-foreground dark:text-primary uppercase">
            <span
              aria-hidden
              className="size-1.5 bg-primary-foreground dark:bg-primary"
            />
            What is Monsterbrew
          </p>
          <div className="grid gap-8 border-b border-white/15 pb-10 md:grid-cols-[1fr_1.15fr] md:gap-x-0">
            <h2 className="mb-0 self-start md:pr-12">
              A free D&D 5e monster statblock builder for Dungeon Masters
            </h2>
            <div className="md:border-l md:border-white/15 md:pl-12">
              <p className="text-lg opacity-80">
                Enter a creature&apos;s abilities and Monsterbrew handles the
                rest. Modifiers, saving throws, passive scores, and HP all
                update as you type. Import from tools you already use, and
                export to well-known formats like Homebrewery or PDF when
                you&apos;re done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-10 sm:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
            <span aria-hidden className="size-1.5 bg-accent" />
            Features
          </p>
          <h2 className="mb-0">Everything you need to run the encounter</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={<FileText />}
            title="Statblock Creator"
            description="A live editor that builds 5e-formatted statblocks as you type. Abilities, saves, and passive scores calculate themselves."
          />
          <FeatureCard
            icon={<Library />}
            title="Creature Library"
            description="Save every creature to your personal library, then search, edit, duplicate, and export them whenever you need them."
          />
          <FeatureCard
            icon={<HardDriveDownload />}
            title="Locally Saved"
            description="Everything lives in your browser. No account and no sign-up required."
          />
        </div>
      </section>

      {/* Creature building guide */}
      <section className="relative px-4 py-10 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
              <span aria-hidden className="size-1.5 bg-accent" />
              Creature building guide
            </p>
            <h2>Learn how to build a balanced and exciting monster</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Not sure where to start? The guide walks you through monster
              design with the 2024 rules. It covers the numbers behind challenge
              rating, how to budget offense and defense, and the pitfalls that
              happen to most homebrew.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/guide">
                <Button color="accent">
                  Read the guide <ArrowRight />
                </Button>
              </Link>
              <Link to="/guide/quick-reference">
                <Button color="neutral" variant="outline">
                  Quick reference
                </Button>
              </Link>
            </div>
          </div>
          <ol className="border-b border-foreground/10">
            {guideChapters.map((title, index) => (
              <li
                key={title}
                className="flex items-baseline gap-4 border-t border-foreground/10 py-3"
              >
                <span className="text-xs font-medium tracking-widest text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-medium">{title}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-4 py-10 sm:px-8">
        <CornerBrackets />
        <div className="mb-10 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
            <span aria-hidden className="size-1.5 bg-accent" />
            FAQ
          </p>
          <h2 className="mb-0">Frequently asked questions</h2>
        </div>
        <dl className="mx-auto max-w-3xl">
          {faq.map(({ question, answer }) => (
            <div
              key={question}
              className="border-t border-foreground/10 py-6 last:border-b"
            >
              <dt className="mb-2 font-semibold">{question}</dt>
              <dd className="text-muted-foreground">{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-accent p-10 text-center text-primary-foreground dark:text-foreground ring-1 ring-foreground/10 sm:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15 mask-[radial-gradient(ellipse_70%_70%_at_50%_50%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--primary-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--primary-foreground) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="relative">
          <h2 className="mb-3">Ready to brew your first monster?</h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80 dark:text-foreground/80">
            Jump into the editor and start brewing!
          </p>
          <Link to="/editor">
            <Button size="lg" color="primary">
              Start Brewing <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
