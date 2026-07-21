/* eslint-env node */
const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // CI lints the PR title + description through commitlint (see
    // .github/workflows/ci-commitlint.yml), treating the description as the
    // commit body. Markdown descriptions with prose, links and bullets routinely
    // exceed 100 chars, so the default cap failed nearly every PR. Disable it.
    "body-max-line-length": [0, "always", Infinity],
  },
};

export default commitlintConfig;
