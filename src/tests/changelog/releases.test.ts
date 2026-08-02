import { describe, expect, it } from "vitest";
import {
  buildReleases,
  buildUnreleased,
  parseChangelogEntry,
  releases,
} from "@/lib/releases";

const entry = (frontmatter: string, body: string) =>
  `---\n${frontmatter}\n---\n\n${body}\n`;

describe("parseChangelogEntry", () => {
  it("parses frontmatter, summary paragraphs, and change bullets", () => {
    const parsed = parseChangelogEntry(
      entry(
        "version: 3.6.0\ndate: 2026-07-22\ntitle: Export is back\nbadge: Major",
        "First paragraph.\n\nSecond paragraph\nwrapped across lines.\n\n- Bullet one\n- Bullet two",
      ),
    );
    expect(parsed.version).toBe("3.6.0");
    expect(parsed.date).toBe("2026-07-22");
    expect(parsed.title).toBe("Export is back");
    expect(parsed.badge).toBe("Major");
    expect(parsed.summary).toEqual([
      "First paragraph.",
      "Second paragraph wrapped across lines.",
    ]);
    expect(parsed.changes).toEqual(["Bullet one", "Bullet two"]);
  });

  it("handles entries without frontmatter", () => {
    const parsed = parseChangelogEntry("Just a summary.\n\n- One change\n");
    expect(parsed.version).toBeUndefined();
    expect(parsed.summary).toEqual(["Just a summary."]);
    expect(parsed.changes).toEqual(["One change"]);
  });

  it("keeps colons inside frontmatter values", () => {
    const parsed = parseChangelogEntry(
      entry("version: 1.0.0\ntitle: Feature: now with colons", "Body."),
    );
    expect(parsed.title).toBe("Feature: now with colons");
  });
});

describe("buildReleases", () => {
  it("merges entries that share a version and sorts by semver descending", () => {
    const built = buildReleases({
      "a.md": entry("version: 3.10.0\ndate: 2026-07-25", "Ten.\n\n- Change A"),
      "b.md": entry(
        "version: 3.10.0\ntitle: Big one",
        "More ten.\n\n- Change B",
      ),
      "c.md": entry("version: 3.2.0\ndate: 2026-07-20", "Two.\n\n- Change C"),
    });
    expect(built.map((release) => release.version)).toEqual([
      "3.10.0",
      "3.2.0",
    ]);
    expect(built[0].date).toBe("2026-07-25");
    expect(built[0].title).toBe("Big one");
    expect(built[0].summary).toEqual(["Ten.", "More ten."]);
    expect(built[0].changes).toEqual(["Change A", "Change B"]);
  });

  it("skips entries without a version", () => {
    const built = buildReleases({
      "pending.md": entry("title: Not yet", "Pending.\n\n- Change"),
    });
    expect(built).toEqual([]);
  });
});

describe("buildUnreleased", () => {
  it("returns null when there are no pending entries", () => {
    expect(buildUnreleased({})).toBeNull();
  });

  it("merges pending entries under an unreleased pseudo-version", () => {
    const merged = buildUnreleased({
      "a.md": entry("title: Pending", "One.\n\n- Change A"),
      "b.md": "Two.\n\n- Change B\n",
    });
    expect(merged?.version).toBe("unreleased");
    expect(merged?.date).toBeUndefined();
    expect(merged?.summary).toEqual(["One.", "Two."]);
    expect(merged?.changes).toEqual(["Change A", "Change B"]);
  });
});

describe("bundled changelog content", () => {
  it("loads the released entries newest-first with valid shapes", () => {
    expect(releases.length).toBeGreaterThan(0);
    for (const release of releases) {
      expect(release.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // A release needs some content, but summary-only entries are legal —
      // the pipeline promotes them (3.14.2) and the page renders them.
      expect(
        release.summary.length + release.changes.length,
      ).toBeGreaterThan(0);
    }
    const versions = releases.map((release) => release.version);
    const sorted = [...versions].sort((a, b) => {
      const pa = a.split(".").map(Number);
      const pb = b.split(".").map(Number);
      return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
    });
    expect(versions).toEqual(sorted);
  });

  it("keeps the 3.0.0 major release intact", () => {
    const major = releases.find((release) => release.version === "3.0.0");
    expect(major?.badge).toBe("Major");
    expect(major?.title).toBe("A ground-up modernization");
  });
});
