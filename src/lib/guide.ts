export type GuideHeading = {
  id: string;
  text: string;
};

export type GuideChapterMeta = {
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  headings: Array<GuideHeading>;
};

export type GuideChapter = GuideChapterMeta & {
  body: string;
};

/** Turns heading text into the anchor id GuideMarkdown renders for it. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

function fileToSlug(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  return name.replace(/^\d+-/, "").replace(/\.md$/, "");
}

function parseChapter(path: string, raw: string): GuideChapter {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const meta: Record<string, string> = {};
  if (frontmatter) {
    for (const line of frontmatter[1].split(/\r?\n/)) {
      const separator = line.indexOf(":");
      if (separator > 0) {
        meta[line.slice(0, separator).trim()] = line
          .slice(separator + 1)
          .trim();
      }
    }
  }
  const body = frontmatter ? raw.slice(frontmatter[0].length) : raw;
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => ({
    id: slugify(match[1]),
    text: match[1],
  }));
  return {
    slug: fileToSlug(path),
    order: 0,
    title: meta.title ?? "",
    shortTitle: meta.shortTitle ?? meta.title ?? "",
    description: meta.description ?? "",
    headings,
    body,
  };
}

const files = import.meta.glob<string>("../content/guide/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export const guideChapters: Array<GuideChapter> = Object.keys(files)
  .sort()
  .map((path, index) => ({ ...parseChapter(path, files[path]), order: index }));

export const guideChapterMeta: Array<GuideChapterMeta> = guideChapters.map(
  ({ body: _body, ...meta }) => meta,
);

export function getGuideChapter(slug: string): {
  chapter: GuideChapter;
  prev: GuideChapterMeta | undefined;
  next: GuideChapterMeta | undefined;
} | null {
  const index = guideChapters.findIndex((chapter) => chapter.slug === slug);
  if (index === -1) return null;
  return {
    chapter: guideChapters[index],
    prev: guideChapterMeta[index - 1],
    next: guideChapterMeta[index + 1],
  };
}
