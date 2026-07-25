export type Release = {
  version: string;
  date?: string;
  badge?: string;
  title?: string;
  summary: Array<string>;
  changes: Array<string>;
};

type ChangelogEntry = {
  version?: string;
  date?: string;
  badge?: string;
  title?: string;
  summary: Array<string>;
  changes: Array<string>;
};

/**
 * Parses a changelog entry file: optional `key: value` frontmatter, then a
 * body where plain paragraphs become `summary` and `- ` bullets become
 * `changes`.
 */
export function parseChangelogEntry(raw: string): ChangelogEntry {
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
  const summary: Array<string> = [];
  const changes: Array<string> = [];
  let paragraph: Array<string> = [];
  const flush = () => {
    if (paragraph.length > 0) summary.push(paragraph.join(" "));
    paragraph = [];
  };
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "") {
      flush();
    } else if (trimmed.startsWith("- ")) {
      flush();
      changes.push(trimmed.slice(2).trim());
    } else {
      paragraph.push(trimmed);
    }
  }
  flush();

  return {
    version: meta.version,
    date: meta.date,
    badge: meta.badge,
    title: meta.title,
    summary,
    changes,
  };
}

/**
 * Merges entries that share a version (several PRs can land in one release,
 * each with its own entry file) into a single Release.
 */
function mergeEntries(
  version: string,
  entries: Array<ChangelogEntry>,
): Release {
  return {
    version,
    date: entries.find((entry) => entry.date)?.date,
    badge: entries.find((entry) => entry.badge)?.badge,
    title: entries.find((entry) => entry.title)?.title,
    summary: entries.flatMap((entry) => entry.summary),
    changes: entries.flatMap((entry) => entry.changes),
  };
}

function compareVersionsDesc(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsB[i] ?? 0) - (partsA[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function buildReleases(files: Record<string, string>): Array<Release> {
  const byVersion = new Map<string, Array<ChangelogEntry>>();
  for (const path of Object.keys(files).sort()) {
    const entry = parseChangelogEntry(files[path]);
    if (!entry.version) continue;
    const entries = byVersion.get(entry.version) ?? [];
    entries.push(entry);
    byVersion.set(entry.version, entries);
  }
  return [...byVersion.entries()]
    .map(([version, entries]) => mergeEntries(version, entries))
    .sort((a, b) => compareVersionsDesc(a.version, b.version));
}

export function buildUnreleased(
  files: Record<string, string>,
): Release | null {
  const entries = Object.keys(files)
    .sort()
    .map((path) => parseChangelogEntry(files[path]));
  if (entries.length === 0) return null;
  return mergeEntries("unreleased", entries);
}

const releasedFiles = import.meta.glob<string>(
  "../content/changelog/releases/*.md",
  { eager: true, query: "?raw", import: "default" },
);

const unreleasedFiles = import.meta.glob<string>(
  "../content/changelog/unreleased/*.md",
  { eager: true, query: "?raw", import: "default" },
);

export const releases: Array<Release> = buildReleases(releasedFiles);

/**
 * Entries not yet promoted to a version. Only ever non-null during local
 * development or on PR previews — the release pipeline stamps and moves
 * pending entries before a production deploy.
 */
export const unreleased: Release | null = buildUnreleased(unreleasedFiles);
