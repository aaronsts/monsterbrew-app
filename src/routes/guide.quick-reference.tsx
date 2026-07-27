import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CombatRolesChart } from "@/app/guide/components/combat-roles-chart";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SITE_URL, seo } from "@/lib/seo";
import { Section } from "@/app/guide/components/section";
import { Card } from "@/components/ui/card";

const QUICK_FORMULAS: Array<{ stat: string; formula: string }> = [
  { stat: "AC and save DC", formula: "12 + half the creature's CR" },
  { stat: "Hit points", formula: "(15 x CR) + 15" },
  { stat: "Attack bonus", formula: "4 + half the creature's CR" },
  { stat: "Damage per round", formula: "(7 x CR) + 5" },
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
                    name: "Quick reference",
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
  component: QuickReferencePage,
});

function QuickReferencePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 pb-16">
      <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
        <span aria-hidden className="size-1.5 bg-accent" />
        cheat sheet
      </p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
        Quick Reference
      </h1>
      <p className="text-muted-foreground">
        A condensed version of the{" "}
        <Link
          to="/guide"
          className="underline underline-offset-4 hover:text-foreground"
        >
          guide
        </Link>{" "}
        . You can use it as a checklist while you build, and open a chapter when
        you want to go more in depth.
      </p>

      <Section title="Identity" slug="fundamentals">
        <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
          <li>
            Write one sentence about the creature before you open the statblock.
            Test every choice against it.
          </li>
          <li>
            Fill in size, type, movement, and senses first. They follow from the
            concept and need no balancing.
          </li>
          <li>
            Pick the role this creature will play in combat, and let it decide
            where the numbers bend. Click a role to see how its stats compare to
            the CR baseline.
          </li>
          <li>
            Count turns. One monster acts once per round, a party acts four or
            five times.
          </li>
          <CombatRolesChart />
        </ul>
      </Section>

      <Section title="The numbers" slug="challenge-rating">
        <Card className="mb-4 border py-0">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4">Stat</TableHead>
                <TableHead className="px-4">Formula</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {QUICK_FORMULAS.map((row) => (
                <TableRow key={row.stat} className="hover:bg-transparent">
                  <TableCell className="px-4 font-medium">{row.stat}</TableCell>
                  <TableCell className="px-4 whitespace-normal text-muted-foreground">
                    {row.formula}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
          <li>
            Deviate from the baseline to fit the role, but adjust. More damage
            means fewer hit points or lower AC.
          </li>
          <li>
            If every stat sits above the baseline, that's not a tough monster,
            that's a higher CR. Raise it.
          </li>
          <li>
            Cross-check: average the defensive CR with the offensive CR. It
            should match the CR you wrote down.
          </li>
        </ul>
      </Section>

      <Section title="Offense & defense" slug="offense-defense">
        <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
          <li>
            The math is based on a three-round fight. Balance the average damage
            of the creature's three best rounds, not its single biggest one.
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
            Make save DC rely on just one ability. If an attack also poisons,
            restrains, or knocks prone, lower its damage.
          </li>
          <li>
            A solo boss needs about 25% more damage, three legendary actions per
            round, legendary resistance 3/day, and ideally a few allies.
          </li>
        </ul>
      </Section>

      <Section title="Traits and actions" slug="traits-actions-flavor">
        <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
          <li>
            Three actions is usually enough, five is the maximum. A fight lasts
            three to five rounds.
          </li>
          <li>
            Abilities should force a decision. Flat extra damage doesn't force
            any.
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
        </ul>
      </Section>

      <Section title="Avoid" slug="common-pitfalls">
        <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
          <li>A longer fight needs more threat, not more hit points.</li>
          <li>Don't take the same player's turns away round after round.</li>
          <li>Cut abilities, or split them over two monsters.</li>
          <li>Bring minions, or the full legendary package.</li>
          <li>
            Immunity to the party's favorite tricks. Build lightning rods for
            them instead.
          </li>
        </ul>
      </Section>

      <Section title="Playtest" slug="playtesting">
        <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
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
        </ul>
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
