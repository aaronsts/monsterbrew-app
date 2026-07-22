const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // CI lints the PR title + description through commitlint (see
    // .github/workflows/ci-commitlint.yml), treating the description as the
    // commit body. Markdown descriptions with prose, links and bullets routinely
    // exceed 100 chars, so the default caps failed nearly every PR.
    //
    // The parser also splits trailing lines (issue refs like `Closes #12`, URLs,
    // the Co-Authored-By / "Generated with" footer) into the *footer* section,
    // so `body-max-line-length` alone isn't enough — `footer-max-line-length`
    // trips on those instead. Disable both.
    "body-max-line-length": [0, "always", Infinity],
    "footer-max-line-length": [0, "always", Infinity],
  },
};

export default commitlintConfig;
