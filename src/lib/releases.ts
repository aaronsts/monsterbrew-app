type Release = {
  version: string;
  date: string;
  badge?: string;
  title?: string;
  summary?: string;
  changes: Array<string>;
};

export const releases: Array<Release> = [
  {
    version: "3.6.4",
    date: "2026-07-25",
    summary:
      "Monsterbrew has a new look. The whole app now draws from one carefully tuned color palette.",
    changes: [
      "New color theme across the app",
      "Creature type badges now carry their own colors, so types are easier to spot at a glance",
      "Buttons, alerts, and notifications share one consistent set of styles in both themes",
      "New fonts: Oxanium for headings and JetBrains Mono for everything else",
    ],
  },
  {
    version: "3.6.3",
    date: "2026-07-25",
    summary:
      "Monsterbrew now has a direct line for your ideas and bug reports. A new “Send feedback” form in the footer lets you share thoughts in a couple of clicks — no account needed — and lands straight in our inbox. Prefer GitHub? A “Report a bug” link takes you right to the issue tracker.",
    changes: [
      "Added a “Send feedback” form to the footer — leave your email if you'd like a reply, or send it anonymously",
      "Added a “Report a bug” link to the footer that opens a new GitHub issue",
    ],
  },
  {
    version: "3.6.2",
    date: "2026-07-24",
    summary:
      "A small fix for old links: the former My creatures page now sends you straight to the Library, where your saved creatures live today. Bookmarks and links from before the move keep working.",
    changes: [
      "Old /my-creatures links and bookmarks now redirect to the Library",
    ],
  },
  {
    version: "3.6.1",
    date: "2026-07-22",
    summary:
      "We switched our privacy-friendly analytics provider to Umami. As before, there are no cookies, no cross-site tracking, and no personal data collected — only anonymous, aggregated stats that help us understand how Monsterbrew is used. The Privacy page has been updated to match.",
    changes: [
      "Moved analytics to Umami, a cookieless, privacy-first service",
      "Updated the Privacy page to reflect the new provider",
    ],
  },
  {
    version: "3.6.0",
    date: "2026-07-22",
    title: "Export is back",
    summary:
      "Homebrewery and PDF export return, now on the creature detail page. Open any saved creature and use the Export menu to hand off your statblock — as Homebrewery V3 markdown you can copy or download, or as a print-ready PDF styled like an official 2024 statblock.",
    changes: [
      "Export any saved creature to Homebrewery V3 markdown — copy it to the clipboard or save it as a .md file",
      "Export a PDF that mirrors the classic 2024 statblock look, with parchment background, red headings, and a two-column layout that fits a page",
    ],
  },
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
    changes: ["Restructured the main marketing pages", "Rebuilt site footer"],
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
