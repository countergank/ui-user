// eslint.config.js
// ESLint flat config for React + TypeScript projects.
// Includes: jsx-a11y strict mode, TypeScript strict rules, React hooks rules.
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * Design-system guard: no hardcoded hex colors in TS/TSX
 * (docs/design-system.md, "tokens only, never hex").
 *
 * This lives in ESLint and not Biome on purpose: Biome 1.9.4 ships no hex-color
 * rule (`nursery/noHexColors` and `suspicious/noHexColors` both report "This rule
 * doesn't exist"), and ESLint cannot lint CSS. The TypeScript/TSX half is here;
 * the CSS-file half is the disk scan in `src/styles/no-hardcoded-hex.test.ts`.
 */
const HEX_COLOR_MESSAGE =
  "Hardcoded hex color. Use a design token instead: a Tailwind utility " +
  "(bg-primary, text-muted-foreground, border-success/30) or hsl(var(--token)). " +
  "See docs/design-system.md.";

/** A 3/4/6/8-digit hex color, shared by the literal and template-literal selectors. */
const HEX_COLOR_PATTERN = "#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b";

/** Flags string literals and template literals that contain a hex color. */
const NO_HEX_COLOR_SELECTORS = [
  `Literal[value=/${HEX_COLOR_PATTERN}/]`,
  `TemplateElement[value.raw=/${HEX_COLOR_PATTERN}/]`,
].map((selector) => ({ selector, message: HEX_COLOR_MESSAGE }));

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

  // Design system — no hardcoded hex colors in application code (docs/design-system.md).
  // Scoped to `src/` so config files at the repo root stay out of the way.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...NO_HEX_COLOR_SELECTORS],
    },
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
