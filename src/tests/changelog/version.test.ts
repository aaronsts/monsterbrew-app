import { describe, expect, it } from "vitest";
import { latestVersion, latestVersionFromPaths } from "@/lib/version";
import { releases } from "@/lib/releases";

describe("latestVersionFromPaths", () => {
  it("picks the highest semver from entry filenames", () => {
    expect(
      latestVersionFromPaths([
        "../content/changelog/releases/3.2.0.md",
        "../content/changelog/releases/3.10.1-export-fix.md",
        "../content/changelog/releases/3.9.0.md",
      ]),
    ).toBe("3.10.1");
  });

  it("ignores files without a version prefix and handles empty input", () => {
    expect(latestVersionFromPaths(["../releases/notes.md"])).toBeNull();
    expect(latestVersionFromPaths([])).toBeNull();
  });
});

describe("latestVersion", () => {
  it("matches the newest release on the changelog page", () => {
    expect(latestVersion).toBe(releases[0].version);
  });
});
