import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SITE_URL, seo } from "@/lib/seo";

/**
 * The seven combat roles from the Lazy GM's Resource Document (CC-BY 4.0),
 * with how each one bends the stats away from its CR baseline.
 */
const COMBAT_ROLES: Array<{ name: string; tooltip: string }> = [
  {
    name: "Ambusher",
    tooltip:
      "Hides, strikes, and hides again. Hits harder than the CR baseline, with lower HP and AC in exchange.",
  },
  {
    name: "Artillery",
    tooltip:
      "Fights from range. Higher attack bonus and damage than the baseline, lower HP and AC. The classic glass cannon.",
  },
  {
    name: "Bruiser",
    tooltip:
      "Big melee damage. Above-baseline damage, and easier to hit or quicker to drop in exchange.",
  },
  {
    name: "Controller",
    tooltip:
      "Imposes conditions: grapples, restrains, frightens, poisons. Lower damage than the baseline, because the save DC does the work.",
  },
  {
    name: "Defender",
    tooltip:
      "Soaks hits and keeps enemies off its allies. Higher AC and HP than the baseline, lower damage.",
  },
  {
    name: "Leader",
    tooltip:
      "Heals, buffs, or repositions its allies. Its own damage sits below the baseline; the allies make up the difference.",
  },
  {
    name: "Skirmisher",
    tooltip:
      "Darts in and out of the fight. More speed and mobility than the baseline, less HP.",
  },
];

const QUICK_FORMULAS: Array<{ stat: string; formula: string }> = [
  { stat: "AC and save DC", formula: "12 + ½ CR" },
  { stat: "Hit points", formula: "(15 × CR) + 15" },
  { stat: "Attack bonus", formula: "4 + ½ CR" },
  { stat: "Damage per round", formula: "(7 × CR) + 5" },
  { stat: "Attacks", formula: "one, plus another at CR 2, 7, 11, and 15" },
];

export const Route = createFileRoute("/guide/quick-reference")({
  head: () => {
    const path = "/guide/quick-reference";
    const { meta, links } = seo({
      title: "Monster Building Cheat Sheet | Monsterbrew Guide",
      description:
        "The whole Monsterbrew creature building guide on one page: combat roles, CR formulas, damage budgets, trait rules, and playtest checks for D&D 5e 2024.",
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
                    name: "Cheat sheet",
                    item: `${SITE_URL}${path}`,
                  },
                ],
              },
              {
                "@type": "Article",
                headline: "Monster building cheat sheet",
                url: `${SITE_URL}${path}`,
                description:
                  "A one-page checklist version of the Monsterbrew creature building guide for D&D 5e 2024.",
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
  component: CheatSheetPage,
});

function Section({
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

function Checklist({ children }: { children: ReactNode }) {
  return (
    <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
      {children}
    </ul>
  );
}

function CheatSheetPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 pb-16">
      <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
        <span aria-hidden className="size-1.5 bg-accent" />
        Quick reference
      </p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
        The cheat sheet
      </h1>
      <p className="text-muted-foreground">
        The whole{" "}
        <Link
          to="/guide"
          className="underline underline-offset-4 hover:text-foreground"
        >
          guide
        </Link>{" "}
        on one page. Use it as a checklist while you build, and open a chapter
        when you want the reasoning behind a rule.
      </p>

      <Section title="Identity" slug="fundamentals">
        <Checklist>
          <li>
            Write one sentence about the creature before you open the statblock.
            Test every choice against it.
          </li>
          <li>
            Fill in size, type, movement, and senses first. They follow from the
            concept and need no balancing.
          </li>
          <li>
            Pick a combat role, and let it decide where the numbers bend. Hover
            over a role to see how:
            <TooltipProvider>
              <ul className="mt-3 flex flex-wrap gap-2">
                {COMBAT_ROLES.map((role) => (
                  <li key={role.name} className="list-none">
                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        className="cursor-help border border-border px-3 py-1 text-sm transition-colors hover:border-accent hover:text-accent"
                      >
                        {role.name}
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-3xs p-3 text-left"
                      >
                        {role.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </li>
          <li>
            Count turns. One monster acts once per round, a party acts four or
            five times.
          </li>
        </Checklist>
      </Section>

      <Section title="The numbers" slug="challenge-rating">
        <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border border-border bg-card p-4 text-sm">
          {QUICK_FORMULAS.map((row) => (
            <div key={row.stat} className="col-span-2 grid grid-cols-subgrid">
              <dt className="font-medium">{row.stat}</dt>
              <dd className="text-muted-foreground">{row.formula}</dd>
            </div>
          ))}
        </dl>
        <Checklist>
          <li>
            Deviate from the baseline to fit the role, and pay for it: more
            damage means fewer hit points, more AC means less damage.
          </li>
          <li>
            If every stat sits above the baseline, that's not a tough monster,
            that's a higher CR. Raise it.
          </li>
          <li>
            Cross-check: average the CR its defenses look like with the CR its
            offense looks like. That average should match the CR you wrote down.
          </li>
        </Checklist>
      </Section>

      <Section title="Spend the budget" slug="offense-defense">
        <Checklist>
          <li>
            The math assumes a three-round fight. Balance the average of the
            creature's three best rounds, not its single biggest one.
          </li>
          <li>
            An effect that hits two or more characters counts double. Budget it
            at half the damage-per-round number.
          </li>
          <li>
            A recharge ability may spike above budget if the normal rounds stay
            under it. Give the spike a visible tell.
          </li>
          <li>
            Key every save DC to one ability. If an attack also poisons,
            restrains, or knocks prone, lower its damage.
          </li>
          <li>
            A solo boss needs about 25% more damage, three legendary actions per
            round, legendary resistance 3/day, and ideally a few allies.
          </li>
        </Checklist>
      </Section>

      <Section title="Traits and actions" slug="traits-actions-flavor">
        <Checklist>
          <li>
            Three actions is usually enough, five is the maximum. A fight lasts
            three to five rounds.
          </li>
          <li>
            Every ability should force a decision. Flat extra damage doesn't
            force any.
          </li>
          <li>Telegraph big abilities a round early, then pay off.</li>
          <li>Match damage types to the concept.</li>
          <li>
            Insert attacks and saves with the{" "}
            <Link
              to="/editor"
              className="underline underline-offset-4 hover:text-foreground"
            >
              editor
            </Link>
            's Attack line and Saving throw line options, so the numbers
            recompute when the stats change.
          </li>
          <li>
            End with one line of behavior: how it opens, what it protects, when
            it runs.
          </li>
        </Checklist>
      </Section>

      <Section title="Avoid" slug="common-pitfalls">
        <Checklist>
          <li>
            The HP sponge. A longer fight needs more threat, not more hit
            points.
          </li>
          <li>
            The stun-lock. Don't take the same player's turns away round after
            round.
          </li>
          <li>
            The overloaded statblock. Cut abilities, or split them over two
            monsters.
          </li>
          <li>
            The unsupported solo boss. Bring minions, or the full legendary
            package.
          </li>
          <li>
            Immunity to the party's favorite tricks. Build lightning rods for
            them instead.
          </li>
        </Checklist>
      </Section>

      <Section title="Playtest" slug="playtesting">
        <Checklist>
          <li>
            Put the statblock next to its CR row, and next to a{" "}
            <Link
              to="/library"
              search={{ source: "srd" }}
              className="underline underline-offset-4 hover:text-foreground"
            >
              published monster
            </Link>{" "}
            of the same CR.
          </li>
          <li>
            Check the extremes: its best possible round shouldn't delete a
            character, and a stunned round one shouldn't delete the monster.
          </li>
          <li>
            Encounter check: possibly deadly when the monsters' total CR is more
            than ¼ of the characters' total levels (levels 1–4), or ½ (level 5
            and up).
          </li>
          <li>
            Adjust during the fight, edit the statblock the same evening, and
            keep the version that played better. Duplicating in{" "}
            <Link
              to="/my-creatures"
              className="underline underline-offset-4 hover:text-foreground"
            >
              your library
            </Link>{" "}
            is free.
          </li>
        </Checklist>
      </Section>

      <div className="mt-12 flex flex-col gap-6 border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          The formulas and roles are adapted from the Lazy GM's 5e Monster
          Builder Resource Document (CC-BY 4.0) and Paul Hughes's 2024 Monster
          Manual analysis. Full credits in{" "}
          <Link
            to="/guide/$slug"
            params={{ slug: "sources" }}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Sources and attribution
          </Link>
          .
        </p>
        <div>
          <Link to="/guide">
            <Button color="neutral" variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Back to the guide
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
