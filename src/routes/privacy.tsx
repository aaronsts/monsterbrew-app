import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Database,
  RefreshCw,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CornerBrackets } from "@/components/home/corner-brackets";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

const LAST_UPDATED = "20 July 2026";

type Section = {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    icon: <BarChart3 />,
    title: "Analytics",
    body: (
      <>
        <p className="text-muted-foreground">
          We use{" "}
          <a
            href="https://plausible.io/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Plausible Analytics
          </a>
          , a privacy-focused service, to understand how the Service is used in
          aggregate. Plausible is designed to be privacy-first:
        </p>
        <ul className="mt-3 space-y-1.5 text-muted-foreground">
          <li>It does not use cookies or any persistent identifiers.</li>
          <li>
            It does not collect personal data or track you across websites.
          </li>
          <li>
            It records only anonymous, aggregated metrics such as page views,
            referring sites, and general visitor counts.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: <Database />,
    title: "Data You Create",
    body: (
      <p className="text-muted-foreground">
        Any creatures, statblocks, and related content you build are stored
        locally in your own browser using IndexedDB. This data never leaves your
        device and is not transmitted to or stored on any server we control.
        Clearing your browser data will permanently remove it.
      </p>
    ),
  },
  {
    icon: <ShieldCheck />,
    title: "What We Do Not Do",
    body: (
      <ul className="space-y-1.5 text-muted-foreground">
        <li>We do not collect or store your personal information.</li>
        <li>We do not build profiles about you.</li>
        <li>We do not sell, rent, or share your data with third parties.</li>
        <li>We do not use your data for advertising or marketing.</li>
      </ul>
    ),
  },
  {
    icon: <Share2 />,
    title: "Third-Party Services",
    body: (
      <p className="text-muted-foreground">
        The Service relies on third-party providers, including Plausible
        Analytics and our hosting provider, to operate. These providers process
        only the limited, anonymous technical information necessary to deliver
        the Service. Their handling of that information is governed by their own
        privacy policies.
      </p>
    ),
  },
  {
    icon: <RefreshCw />,
    title: "Changes to This Policy",
    body: (
      <p className="text-muted-foreground">
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page with a revised effective date.
      </p>
    ),
  },
];

function Privacy() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8">
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
          Legal
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          Monsterbrew is a passion project. Protecting your privacy is a core
          part of how it is built, here is exactly what that means.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="relative">
            <CardHeader>
              <div className="mb-1 flex size-11 items-center justify-center bg-accent/10 text-accent ring-1 ring-accent/25 [&_svg]:size-5">
                {section.icon}
              </div>
              <h2 className="mb-0 text-xl font-semibold">{section.title}</h2>
            </CardHeader>
            <CardContent>{section.body}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
