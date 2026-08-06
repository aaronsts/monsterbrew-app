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
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // `MonsterForm` renders `<Form {...form}>` — react-hook-form's
    // `FormProvider` — which builds a new context value on every render, so
    // anything that re-renders it re-renders every `useFormContext()` consumer
    // beneath it, `React.memo` included. Subscribing to form values here put a
    // full editor re-render on every keystroke (#158). The unit tests can't
    // catch a regression in this file (it needs a router and a query client to
    // render), so the guard lives here instead.
    files: ["src/app/editor/components/monster-form.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='useWatch']",
          message:
            "Don't subscribe to form values in MonsterForm — it re-renders every section through FormProvider. Put the useWatch in a leaf (see StatblockPreview / DerivedValues, and #158).",
        },
        {
          selector: "CallExpression[callee.property.name='watch']",
          message:
            "Don't subscribe to form values in MonsterForm — it re-renders every section through FormProvider. Use `form.subscribe` for side effects, or watch from a leaf (see #158).",
        },
      ],
    },
  },
);
