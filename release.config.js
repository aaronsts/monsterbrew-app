/* eslint-env node */

const releaseConfig = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",

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
        successCmd:
          "echo 'RELEASED=1' >> $GITHUB_ENV && echo 'NEW_VERSION=${nextRelease.version}' >> $GITHUB_ENV",
      },
    ],
  ],
};

export default releaseConfig;
