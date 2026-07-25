const releaseConfig = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          { type: "docs", scope: "README", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "style", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "chore", release: "patch" },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
        },
      },
    ],

    "@semantic-release/release-notes-generator",

    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],

    [
      "@semantic-release/changelog",
      {
        changelogFile: "docs/CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: ["docs/CHANGELOG.md"],
      },
    ],

    [
      "@semantic-release/exec",
      {
        prepareCmd: "node scripts/promote-changelog.mjs ${nextRelease.version}",
        successCmd:
          "echo 'RELEASED=1' >> $GITHUB_ENV && echo 'NEW_VERSION=${nextRelease.version}' >> $GITHUB_ENV",
      },
    ],

    // Commits the promoted changelog entries back to main; the release tag is
    // created on this commit, and the deploy job builds from that tag so the
    // deployed /changelog includes the freshly stamped entries.
    [
      "@semantic-release/git",
      {
        assets: ["src/content/changelog"],
        message:
          "chore(release): promote changelog entries for v${nextRelease.version} [skip ci]",
      },
    ],
  ],
};

export default releaseConfig;
