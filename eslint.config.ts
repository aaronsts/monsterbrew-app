import { defineConfig } from "eslint/config";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { tanstackConfig } from "@tanstack/eslint-config";

export default defineConfig(
  {
    ignores: [
      "dist",
      ".output",
      ".nitro",
      ".vercel",
      ".tanstack",
      ".claude",
      "coverage",
      "node_modules",
      "src/routeTree.gen.ts",
    ],
  },
  ...tanstackConfig,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": "off",
      "no-shadow": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-extra-boolean-cast": "warn",
      "no-fallthrough": "warn",
      "no-constant-binary-expression": "warn",
      "valid-typeof": "warn",
      "preserve-caught-error": "warn",
    },
  },
);
