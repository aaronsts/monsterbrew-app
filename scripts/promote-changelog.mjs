// Stamps pending changelog entries with the released version and date, and
// moves them from src/content/changelog/unreleased/ to .../releases/.
// Run by semantic-release (@semantic-release/exec prepareCmd) as:
//   node scripts/promote-changelog.mjs <version>
// The resulting moves are committed back to main by @semantic-release/git.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error("usage: node scripts/promote-changelog.mjs <version>");
  process.exit(1);
}

const contentDir = process.env.CHANGELOG_DIR ?? "src/content/changelog";
const unreleasedDir = join(contentDir, "unreleased");
const releasesDir = join(contentDir, "releases");
const date = new Date().toISOString().slice(0, 10);

const pending = existsSync(unreleasedDir)
  ? readdirSync(unreleasedDir).filter((file) => file.endsWith(".md"))
  : [];

if (pending.length === 0) {
  console.log(`no pending changelog entries to promote for v${version}`);
  process.exit(0);
}

mkdirSync(releasesDir, { recursive: true });

for (const file of pending) {
  const sourcePath = join(unreleasedDir, file);
  const raw = readFileSync(sourcePath, "utf8");

  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const stamp = `version: ${version}\ndate: ${date}`;
  const kept = frontmatter
    ? frontmatter[1]
        .split(/\r?\n/)
        .filter((line) => !/^(version|date)\s*:/.test(line))
        .join("\n")
    : "";
  const meta = kept ? `${stamp}\n${kept}` : stamp;
  const body = frontmatter ? raw.slice(frontmatter[0].length) : `\n${raw}`;
  const promoted = `---\n${meta}\n---\n${body}`;

  // Prefix with the version so several entries promoted across releases
  // can never collide on filename.
  const target = join(releasesDir, `${version}-${basename(file)}`);
  writeFileSync(target, promoted);
  unlinkSync(sourcePath);
  console.log(`promoted ${file} -> ${target}`);
}

console.log(`promoted ${pending.length} entries to v${version} (${date})`);
