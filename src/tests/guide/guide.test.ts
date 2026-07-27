import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getGuideChapter,
  guideChapterMeta,
  guideChapters,
  slugify,
} from "@/lib/guide";
import { CR_BENCHMARKS } from "@/lib/constants/cr-benchmarks";
import { CHALLENGE_RATINGS } from "@/lib/constants";

const KNOWN_SLOTS = ["cr-table", "combat-roles-chart"];

describe("guide manifest", () => {
  it("loads all chapters with complete frontmatter", () => {
    expect(guideChapters.length).toBeGreaterThanOrEqual(7);
    for (const chapter of guideChapters) {
      expect(chapter.slug).not.toBe("");
      expect(chapter.title).not.toBe("");
      expect(chapter.shortTitle).not.toBe("");
      expect(chapter.description).not.toBe("");
      expect(chapter.body.trim()).not.toBe("");
    }
  });

  it("has unique slugs and ascending order", () => {
    const slugs = guideChapters.map((chapter) => chapter.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(guideChapters.map((chapter) => chapter.order)).toEqual(
      guideChapters.map((_, index) => index),
    );
  });

  it("extracts h2 headings with slugified ids", () => {
    for (const chapter of guideChapters) {
      expect(chapter.headings.length).toBeGreaterThan(0);
      for (const heading of chapter.headings) {
        expect(heading.id).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("matches the filename→slug rule used by generate-sitemap.mjs", () => {
    const slugsFromDisk = readdirSync(join(process.cwd(), "src/content/guide"))
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((file) => file.replace(/^\d+-/, "").replace(/\.md$/, ""));
    expect(guideChapters.map((chapter) => chapter.slug)).toEqual(slugsFromDisk);
  });

  it("only uses known slot markers", () => {
    for (const chapter of guideChapters) {
      for (const match of chapter.body.matchAll(/<!--slot:([a-z-]+)-->/g)) {
        expect(KNOWN_SLOTS).toContain(match[1]);
      }
    }
  });
});

describe("getGuideChapter", () => {
  it("returns null for an unknown slug", () => {
    expect(getGuideChapter("not-a-chapter")).toBeNull();
  });

  it("returns prev/next neighbours at the edges and in the middle", () => {
    const first = getGuideChapter(guideChapters[0].slug);
    expect(first?.prev).toBeUndefined();
    expect(first?.next?.slug).toBe(guideChapters[1].slug);

    const last = getGuideChapter(guideChapters[guideChapters.length - 1].slug);
    expect(last?.prev?.slug).toBe(guideChapters[guideChapters.length - 2].slug);
    expect(last?.next).toBeUndefined();

    const middle = getGuideChapter(guideChapters[1].slug);
    expect(middle?.prev?.slug).toBe(guideChapters[0].slug);
    expect(middle?.next?.slug).toBe(guideChapters[2].slug);
  });

  it("strips the body from chapter meta", () => {
    expect(guideChapterMeta[0]).not.toHaveProperty("body");
  });
});

describe("slugify", () => {
  it("lowercases, strips punctuation, and hyphenates", () => {
    expect(slugify("When to deviate — and how to pay for it")).toBe(
      "when-to-deviate-and-how-to-pay-for-it",
    );
    expect(slugify("Telegraph, then pay off")).toBe("telegraph-then-pay-off");
    expect(slugify("Adjust live — quietly")).toBe("adjust-live-quietly");
  });
});

describe("CR benchmarks", () => {
  it("covers every challenge rating from the editor's list exactly once", () => {
    expect(CR_BENCHMARKS.map((row) => row.cr)).toEqual(
      CHALLENGE_RATINGS.map((rating) => rating.challenge_rating),
    );
  });

  it("has coherent rows", () => {
    let previousDamage = 0;
    for (const row of CR_BENCHMARKS) {
      expect(row.hpMin).toBeLessThanOrEqual(row.hpAverage);
      expect(row.hpAverage).toBeLessThanOrEqual(row.hpMax);
      expect(row.attacks).toBeGreaterThanOrEqual(1);
      expect(row.damagePerRound).toBeGreaterThanOrEqual(previousDamage);
      previousDamage = row.damagePerRound;
    }
  });
});
