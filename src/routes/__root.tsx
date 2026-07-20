import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import "@/app/globals.css";
import "@fontsource-variable/oxanium";
import "@fontsource-variable/jetbrains-mono";

import { Providers } from "@/components/providers/providers";
import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const title = "Monsterbrew | D&D 5e Monster Creator & Homebrew Tool";
const description =
  "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew - the free, intuitive homebrew tool for Dungeon Masters. Design unique encounters for your tabletop RPG campaigns!";

// JSON-LD structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Monsterbrew",
  url: "https://monsterbrew.app",
  description:
    "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew - the free, intuitive homebrew tool for Dungeon Masters.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  keywords:
    "D&D, DnD, Dungeons and Dragons, monster creator, homebrew, 5e, tabletop RPG",
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "D&D monster creator, DnD 5e homebrew, D&D creature builder, Dungeons and Dragons monsters, tabletop RPG tools, DM resources, custom D&D creatures, monster statblock generator, 5e encounter design, fantasy creature creator",
      },
      { name: "creator", content: "Monsterbrew" },
      { property: "og:title", content: title },
      {
        property: "og:description",
        content:
          "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew - the free, intuitive homebrew tool for Dungeon Masters.",
      },
      { property: "og:url", content: "https://monsterbrew.app" },
      { property: "og:site_name", content: "Monsterbrew" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      {
        name: "twitter:description",
        content:
          "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew.",
      },
    ],
    links: [{ rel: "icon", href: "/icon.svg", type: "image/svg+xml" }],
    scripts: [
      {
        defer: true,
        "data-domain": "monsterbrew-app.vercel.app",
        src: "https://plausible.io/js/script.js",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-dvh", "font-mono")}
    >
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-nippo flex flex-col bg-background text-foreground h-dvh antialiased">
        <Providers>
          <SiteHeader />
          <main className="max-w-8xl mx-auto w-full mt-14 flex-1 p-3">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
          <SiteFooter />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
