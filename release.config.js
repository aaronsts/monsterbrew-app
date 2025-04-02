/* eslint-env node */

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
        changelogFile: "CHANGELOG.md",
      },
    ],

    [
      "@semantic-release/github",
      {
        assets: ["CHANGELOG.md"],
      },
    ],

    [
      "@semantic-release/exec",
      {
        successCmd:
          "echo 'RELEASED=1' >> $GITHUB_ENV && echo 'NEW_VERSION=${nextRelease.version}' >> $GITHUB_ENV",
      },
    ],
  ],
};

export default releaseConfig;
