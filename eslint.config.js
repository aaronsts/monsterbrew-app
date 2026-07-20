import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".output",
      ".nitro",
      ".tanstack",
      "src/routeTree.gen.ts",
      "node_modules",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // no-unused-vars is an error for this project (unused imports fail
      // the build); ignoreRestSiblings allows the `{ node, ...props }` omit
      // pattern used in react-markdown component overrides.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      // Pre-existing legacy patterns surfaced by the stricter flat config.
      // Kept as warnings (not errors) so the framework migration doesn't turn
      // lint red on untouched code; clean these up separately.
      "no-extra-boolean-cast": "warn",
      "no-fallthrough": "warn",
      "no-constant-binary-expression": "warn",
      "valid-typeof": "warn",
    },
  },
);
