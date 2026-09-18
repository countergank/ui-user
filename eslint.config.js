// eslint.config.js
// ESLint flat config for React + TypeScript projects.
// Includes: jsx-a11y strict mode, TypeScript strict rules, React hooks rules.
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore build artifacts and vendored/third-party content
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "public/**",
      "openspec/**",
      ".agents/**",
      ".claude/**",
      ".atl/**",
      ".github/**",
      "docs/**",
      "e2e/**",
      "*.config.js",
      "commitlint.config.ts",
      "tailwind.config.js",
      "postcss.config.js",
    ],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript strict
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json", "./tsconfig.e2e.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React + Hooks
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    settings: {
      react: { version: "detect" },
    },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // Accessibility — strict preset catches more than recommended
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: jsxA11y.configs.strict.rules,
  },

  // Project-specific overrides
  {
    rules: {
      // Fail build on any lint warning
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
);
