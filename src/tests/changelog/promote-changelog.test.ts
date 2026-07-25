import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = join(process.cwd(), "scripts/promote-changelog.mjs");

let contentDir: string;

const runPromote = (version: string) =>
  execFileSync("node", [script, version], {
    env: { ...process.env, CHANGELOG_DIR: contentDir },
    encoding: "utf8",
  });

beforeEach(() => {
  contentDir = mkdtempSync(join(tmpdir(), "changelog-"));
  mkdirSync(join(contentDir, "unreleased"), { recursive: true });
});

afterEach(() => {
  rmSync(contentDir, { recursive: true, force: true });
});

describe("promote-changelog", () => {
  it("stamps version and date and moves pending entries", () => {
    writeFileSync(
      join(contentDir, "unreleased", "export-returns.md"),
      "---\ntitle: Export is back\n---\n\nSummary.\n\n- A change\n",
    );
    runPromote("3.7.0");

    expect(readdirSync(join(contentDir, "unreleased"))).toEqual([]);
    const promoted = readFileSync(
      join(contentDir, "releases", "3.7.0-export-returns.md"),
      "utf8",
    );
    expect(promoted).toMatch(
      /^---\nversion: 3\.7\.0\ndate: \d{4}-\d{2}-\d{2}\ntitle: Export is back\n---\n\nSummary\.\n\n- A change\n$/,
    );
  });

  it("promotes entries without frontmatter", () => {
    writeFileSync(
      join(contentDir, "unreleased", "small-fix.md"),
      "A fix.\n\n- Fixed a thing\n",
    );
    runPromote("3.7.1");

    const promoted = readFileSync(
      join(contentDir, "releases", "3.7.1-small-fix.md"),
      "utf8",
    );
    expect(promoted).toMatch(/^---\nversion: 3\.7\.1\ndate: \d{4}-\d{2}-\d{2}\n---\n\nA fix\.\n\n- Fixed a thing\n$/);
  });

  it("promotes multiple pending entries under the same version", () => {
    writeFileSync(join(contentDir, "unreleased", "one.md"), "One.\n\n- A\n");
    writeFileSync(join(contentDir, "unreleased", "two.md"), "Two.\n\n- B\n");
    runPromote("4.0.0");

    expect(readdirSync(join(contentDir, "releases")).sort()).toEqual([
      "4.0.0-one.md",
      "4.0.0-two.md",
    ]);
  });

  it("is a no-op when there is nothing pending", () => {
    const output = runPromote("3.7.2");
    expect(output).toContain("no pending changelog entries");
    expect(readdirSync(contentDir).sort()).toEqual(["unreleased"]);
  });

  it("rejects a missing or malformed version argument", () => {
    expect(() =>
      execFileSync("node", [script], {
        env: { ...process.env, CHANGELOG_DIR: contentDir },
        encoding: "utf8",
        stdio: "pipe",
      }),
    ).toThrow();
  });
});
