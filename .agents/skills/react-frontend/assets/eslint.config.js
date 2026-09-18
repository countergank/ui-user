// eslint.config.js
// ESLint flat config for React + TypeScript projects.
// Includes: jsx-a11y strict mode, TypeScript strict rules, React hooks rules.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  // Base JS recommendations
  js.configs.recommended,

  // TypeScript strict
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React + Hooks
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // Accessibility — strict preset catches more than recommended
  jsxA11y.configs["flat/strict"],

  // Project-specific overrides
  {
    rules: {
      // Fail build on any lint warning
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
);
