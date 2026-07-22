import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { CornerBrackets } from "@/components/home/corner-brackets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/changelog")({
  component: Changelog,
});

type Release = {
  version: string;
  date: string;
  badge?: string;
  title?: string;
  summary?: string;
  changes: Array<string>;
};

const releases: Array<Release> = [
  {
    version: "3.5.4",
    date: "2026-07-22",
    summary:
      "The changelog page is easier to get around now. A sidebar lists every release, highlights the one you're reading as you scroll, and jumps you straight to any version when you click it.",
    changes: [
      "Added an on-this-page sidebar to the changelog that lists every release",
      "The release you're reading highlights automatically as you scroll",
      "Click any version to jump straight to it",
    ],
  },
  {
    version: "3.5.3",
    date: "2026-07-22",
    summary:
      "Saved creatures from before the 3.0 rebuild now upgrade to the current format automatically the first time you open the app — no more per-creature migrate prompt or “Legacy” badges. With every creature on one model, the transitional legacy editor has been retired.",
    changes: [
      "Legacy creatures are migrated once, automatically, when the app loads — the migrate dialog and Legacy badges are gone",
      "Retired the transitional /legacy-editor now that every creature uses the current editor",
      "Homebrewery and PDF export are temporarily unavailable and will return on the creature detail page",
    ],
  },
  {
    version: "3.5.2",
    date: "2026-07-22",
    summary:
      "An under-the-hood change to how Monsterbrew loads and saves your creatures. The library and editor now share a single cached data layer, so pages stay in sync and refresh instantly after you save, duplicate, or delete a creature.",
    changes: [
      "Routed every creature read and write through a single cached data layer (TanStack Query)",
      "Library and detail pages now update immediately after saving, duplicating, or deleting",
    ],
  },
  {
    version: "3.5.1",
    date: "2026-07-21",
    summary:
      "The Defense section can now capture the classic “resistant or immune to bludgeoning, piercing, and slashing from nonmagical weapons” defenses — including the non-silvered variant — and they show up in the statblock automatically.",
    changes: [
      "Added nonmagical and nonsilvered attack defenses to the Defense form",
      "Toggle each between resistant and immune; they render in the statblock's resistances and immunities",
    ],
  },
  {
    version: "3.5.0",
    date: "2026-07-21",
    title: "Dynamic attack tokens",
    summary:
      "Action and trait descriptions now speak 5eTools' {@…} tag markup natively. Attack bonuses, save DCs, and damage can be linked to a creature's ability scores so they recompute automatically as you tweak stats — and imported bestiary text renders without any conversion. Every description field gets an Insert menu with a live preview.",
    changes: [
      "Stat-linked attack tokens: tags like {@hit str}, {@dc con}, and {@damage 2d8+str} recompute from ability modifiers and proficiency bonus",
      "5eTools {@…} markup now renders natively in the statblock, so imported text needs no conversion",
      "New Insert menu and live preview on every action and trait description",
    ],
  },
  {
    version: "3.4.0",
    date: "2026-07-21",
    title: "SRD monsters",
    summary:
      "The full D&D 2024 SRD bestiary is now built in. Browse and filter the official monsters right inside the library, open any one to view its statblock, and copy it into the editor as a starting point for your own homebrew.",
    changes: [
      "Added the D&D 2024 SRD bestiary as a browsable, filterable collection in the library",
      "Read-only statblock view for each SRD monster",
      "Copy any SRD monster into the editor to customize",
    ],
  },
  {
    version: "3.3.0",
    date: "2026-07-21",
    title: "New creature library",
    summary:
      "Your saved creatures now live in a redesigned, filterable library that replaces the old table. Search and filter your collection at a glance, with a toggle to switch between your creatures and other sources.",
    changes: [
      "Replaced the My Creatures table with a filterable library grid",
      "Search and filter your saved creatures",
      "Source toggle to switch between your creatures and other collections",
    ],
  },
  {
    version: "3.2.2",
    date: "2026-07-21",
    summary:
      "Under-the-hood build tooling upgrade to Vite 8 (with the Rolldown bundler). No visible changes — just a faster, more modern build pipeline that keeps Monsterbrew on solid footing.",
    changes: ["Upgraded the build tooling to Vite 8 (Rolldown)"],
  },
  {
    version: "3.2.1",
    date: "2026-07-21",
    summary:
      "A behind-the-scenes fix to the build configuration so production builds output cleanly through Nitro. No user-facing changes.",
    changes: ["Fixed the Vite/Nitro production build configuration"],
  },
  {
    version: "3.2.0",
    date: "2026-07-20",
    title: "New foundation",
    summary:
      "Monsterbrew now runs on TanStack Start. It's a mostly under-the-hood change that sets up a faster, more resilient app: the marketing pages are server-rendered for better SEO and in-app navigation is snappier. Your saved creatures and the editor keep working exactly as before.",
    changes: [
      "Migrated the app from Next.js to TanStack Start (Vite) with server-side rendering",
      "Server-rendered marketing pages (home, privacy, changelog) for better SEO",
      "Faster client-side navigation between pages",
    ],
  },
  {
    version: "3.1.0",
    date: "2026-07-20",
    summary:
      "Reorganized the main pages and gave the site footer a fresh rebuild.",
    changes: [
      "Restructured the main marketing pages",
      "Rebuilt site footer",
    ],
  },
  {
    version: "3.0.0",
    date: "2026-07-20",
    badge: "Major",
    title: "A ground-up modernization",
    summary:
      "The biggest release yet. Monsterbrew has been rebuilt around a new monster model and a redesigned, section-based editor, with a live statblock preview and custom-value overrides. Your existing creatures can be migrated per-creature from the library, and the previous editor stays available at /legacy-editor during the transition.",
    changes: [
      "Rebuilt editor split into Identity, Combat, Defense, and Actions sections",
      "New statblock renderer with custom overrides for HP, passive perception, and languages",
      "New canonical monster model with per-creature migration for saved creatures",
      "Modular, better-tested import converters (5eTools, Improved Initiative, Open5e, TetraCube)",
      "Refreshed UI and theming, including a new light/dark theme toggle",
      "Fixes to HP notation, passive perception, and proficiency bonus calculations",
    ],
  },
  {
    version: "2.2.0",
    date: "2025-05-11",
    summary:
      "Presets are now available to use for traits, actions, and legendary actions! You can apply a preset when you add a new trait or action. Markdown is also made available in the description fields. More info on this will follow soon.",
    changes: [
      "Add presets for traits, actions, and legendary actions",
      "Add markdown support for description fields",
    ],
  },
  {
    version: "2.1.0",
    date: "2025-05-07",
    summary: "Minor UI improvements for number inputs and accessibility.",
    changes: [
      "Add Mythic Actions",
      "Convert inputs for stats / ac to number inputs",
      "Add better accessibility for buttons",
      "Add overwrite for passive perception",
    ],
  },
  {
    version: "2.0.0",
    date: "2025-05-01",
    badge: "Major",
    title: "Major Update",
    summary:
      "Version 2.0 of Monsterbrew is finally here. It's been almost a year since the last update! This version brings a complete UI overhaul and improved creature creating! The biggest change is the live form updating. Besides this feature, there are a ton of other improvements as well.",
    changes: [
      "Complete UI redesign with improved accessibility and mobile responsiveness",
      "Improved import converters",
      "Ability to save creatures locally",
      "Print-optimized layout for statblocks",
      "New 2025 statblock design",
    ],
  },
];

// eslint-disable-next-line react-refresh/only-export-components
function Changelog() {
  const [activeVersion, setActiveVersion] = useState<string>(
    releases[0].version,
  );

  // Scroll-spy: highlight the nav entry for whichever release sits near the top.
  useEffect(() => {
    const sections = releases
      .map((release) => document.getElementById(release.version))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visibility = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }
        const current = releases.find((release) =>
          visibility.get(release.version),
        );
        if (current) setActiveVersion(current.version);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleJump = (
    event: MouseEvent<HTMLAnchorElement>,
    version: string,
  ) => {
    event.preventDefault();
    const target = document.getElementById(version);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${version}`);
    setActiveVersion(version);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Header */}
      <section className="relative flex flex-col items-center gap-4 px-4 py-16 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_45%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <CornerBrackets size="size-8" />
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
          <span aria-hidden className="size-1.5 bg-primary" />
          Releases
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Changelog
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          Everything new in Monsterbrew, newest first. Follow along as the
          statblock builder keeps getting better.
        </p>
      </section>

      <div className="mt-8 flex gap-10 lg:gap-14">
        {/* On-this-page navigation */}
        <aside className="hidden lg:block">
          <nav
            aria-label="Changelog navigation"
            className="sticky top-24 max-h-[calc(100vh-8rem)] w-60 overflow-y-auto pr-2"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
              <span aria-hidden className="size-1.5 bg-primary" />
              On this page
            </p>
            <ul className="flex flex-col border-l border-border">
              {releases.map((release) => {
                const active = activeVersion === release.version;
                return (
                  <li key={release.version}>
                    <a
                      href={`#${release.version}`}
                      onClick={(event) => handleJump(event, release.version)}
                      aria-current={active ? "true" : undefined}
                      title={
                        release.title
                          ? `${release.version} · ${release.title}`
                          : release.version
                      }
                      className={cn(
                        "-ml-px block truncate border-l py-1.5 pl-4 text-sm transition-colors",
                        active
                          ? "border-primary font-medium text-primary"
                          : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                      )}
                    >
                      {release.version}
                      {release.title ? (
                        <span
                          className={
                            active ? "text-primary" : "text-muted-foreground"
                          }
                        >
                          {" · "}
                          {release.title}
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Releases */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {releases.map((release) => (
            <Card
              key={release.version}
              id={release.version}
              className="relative scroll-mt-24"
            >
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="mb-0 text-2xl font-semibold tracking-tight">
                    <span className="text-primary">v{release.version}</span>
                    {release.title ? (
                      <span className="text-foreground">
                        {" — "}
                        {release.title}
                      </span>
                    ) : null}
                  </h2>
                  {release.badge ? (
                    <Badge variant="secondary">{release.badge}</Badge>
                  ) : null}
                </div>
                <time className="text-sm text-muted-foreground">
                  {release.date}
                </time>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {release.summary ? (
                  <p className="text-muted-foreground">{release.summary}</p>
                ) : null}
                <ul className="space-y-1.5 text-muted-foreground">
                  {release.changes.map((change) => (
                    <li key={change} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 bg-primary"
                      />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
