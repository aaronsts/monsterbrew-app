import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import type { GuideChapterMeta } from "@/lib/guide";
import { cn } from "@/lib/utils";

export function ChapterSidebar({
  chapters,
  activeSlug,
}: {
  chapters: Array<GuideChapterMeta>;
  activeSlug?: string;
}) {
  const activeChapter = chapters.find((chapter) => chapter.slug === activeSlug);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [prevSlug, setPrevSlug] = useState(activeSlug);
  if (prevSlug !== activeSlug) {
    setPrevSlug(activeSlug);
    setActiveHeading(null);
  }

  useEffect(() => {
    if (!activeChapter || activeChapter.headings.length === 0) return;

    const sections = activeChapter.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visibility = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }
        const current = activeChapter.headings.find((heading) =>
          visibility.get(heading.id),
        );
        if (current) setActiveHeading(current.id);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activeChapter]);

  const handleJump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveHeading(id);
  };

  return (
    <aside className="hidden lg:block">
      <nav
        aria-label="Guide chapters"
        className="sticky top-24 max-h-[calc(100vh-8rem)] w-64 overflow-y-auto pr-2"
      >
        <Link
          to="/guide"
          className="mb-4 flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase hover:underline"
        >
          <span aria-hidden className="size-1.5 bg-accent" />
          Creature building guide
        </Link>
        <ul className="flex flex-col border-l border-border">
          {chapters.map((chapter) => {
            const active = chapter.slug === activeSlug;
            return (
              <li key={chapter.slug}>
                <Link
                  to="/guide/$slug"
                  params={{ slug: chapter.slug }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-ml-px block border-l py-1.5 pl-4 text-sm transition-colors",
                    active
                      ? "border-accent font-medium text-accent"
                      : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                  )}
                >
                  {chapter.shortTitle}
                </Link>
                {active && chapter.headings.length > 0 ? (
                  <ul className="flex flex-col">
                    {chapter.headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          onClick={(event) => handleJump(event, heading.id)}
                          className={cn(
                            "-ml-px block truncate border-l py-1 pl-8 text-xs transition-colors",
                            activeHeading === heading.id
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                          )}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
