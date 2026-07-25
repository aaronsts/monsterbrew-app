import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { CornerBrackets } from "@/components/home/corner-brackets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { releases, unreleased } from "@/lib/releases";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    ...seo({
      title: "Changelog | Monsterbrew",
      description:
        "What's new in Monsterbrew | release notes for the free D&D 5e monster statblock builder.",
      path: "/changelog",
    }),
  }),
  component: Changelog,
});

const allReleases = unreleased ? [unreleased, ...releases] : releases;

const versionLabel = (version: string) =>
  version === "unreleased" ? "Unreleased" : `v${version}`;

const sidebarLabel = (version: string) =>
  version === "unreleased" ? "Unreleased" : version;

// eslint-disable-next-line react-refresh/only-export-components
function Changelog() {
  const [activeVersion, setActiveVersion] = useState<string>(
    allReleases[0].version,
  );

  useEffect(() => {
    const sections = allReleases
      .map((release) => document.getElementById(release.version))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visibility = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }
        const current = allReleases.find((release) =>
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
            <p className="mb-4 flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
              <span aria-hidden className="size-1.5 bg-accent" />
              On this page
            </p>
            <ul className="flex flex-col border-l border-border">
              {allReleases.map((release) => {
                const active = activeVersion === release.version;
                return (
                  <li key={release.version}>
                    <a
                      href={`#${release.version}`}
                      onClick={(event) => handleJump(event, release.version)}
                      aria-current={active ? "true" : undefined}
                      title={
                        release.title
                          ? `${sidebarLabel(release.version)} · ${release.title}`
                          : sidebarLabel(release.version)
                      }
                      className={cn(
                        "-ml-px block truncate border-l py-1.5 pl-4 text-sm transition-colors",
                        active
                          ? "border-accent font-medium text-accent"
                          : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                      )}
                    >
                      {sidebarLabel(release.version)}
                      {release.title ? (
                        <span
                          className={
                            active ? "text-accent" : "text-muted-foreground"
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
          {allReleases.map((release) => (
            <Card
              key={release.version}
              id={release.version}
              className="relative scroll-mt-24"
            >
              <CardHeader>
                <div className="flex flex-wrap  items-center gap-3">
                  <h2 className="mb-0 text-2xl font-semibold tracking-tight">
                    <span className="text-accent">
                      {versionLabel(release.version)}
                    </span>
                    {release.title ? (
                      <span className="text-accent">
                        {" — "}
                        {release.title}
                      </span>
                    ) : null}
                  </h2>
                  {release.version === "unreleased" ? (
                    <Badge variant="secondary">Pending release</Badge>
                  ) : null}
                  {release.badge ? (
                    <Badge variant="secondary">{release.badge}</Badge>
                  ) : null}
                </div>
                {release.date ? (
                  <time className="text-xs text-muted-foreground italic">
                    {release.date}
                  </time>
                ) : null}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {release.summary.length > 0 ? (
                  <div className="flex flex-col gap-3 text-foreground">
                    {release.summary.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                <ul className="space-y-1.5 text-foreground">
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
