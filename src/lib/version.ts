// Derives the latest released version from the changelog entry filenames
// (`<version>.md` or `<version>-<slug>.md`). Deliberately a lazy glob whose
// loaders are never called: only the file paths reach the bundle, not the
// changelog content — this module is safe to import from the site footer on
// every page. The full content loader lives in `releases.ts`.
const releaseFiles = import.meta.glob("../content/changelog/releases/*.md", {
  query: "?raw",
  import: "default",
});

export function latestVersionFromPaths(paths: Array<string>): string | null {
  const versions = paths
    .map((path) => /\/(\d+\.\d+\.\d+)[^/]*\.md$/.exec(path)?.[1])
    .filter((version): version is string => Boolean(version))
    .sort((a, b) => {
      const partsA = a.split(".").map(Number);
      const partsB = b.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        if (partsB[i] !== partsA[i]) return partsB[i] - partsA[i];
      }
      return 0;
    });
  return versions[0] ?? null;
}

export const latestVersion: string | null = latestVersionFromPaths(
  Object.keys(releaseFiles),
);
