import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  js.configs.recommended,

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

  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // Accessibility — strict preset catches more than recommended
  jsxA11y.configs["flat/strict"],

  {
    rules: {
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // Tool gate (skills-reduction / COU-333): these checks replace the
      // former `tool` rule files, which are deleted only because this config
      // enforces them on every commit.
      // conditional-rendering
      "react/jsx-no-leaked-render": "error",
      // displayname
      "react/display-name": "error",
      // no-dangerously-set-html
      "react/no-danger": "error",
      // hooks-rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      // error-instances
      "no-throw-literal": "error",
      // nullish-coalescing
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      // no-non-null-assertions
      "@typescript-eslint/no-non-null-assertion": "error",
      // optional-chaining
      "@typescript-eslint/prefer-optional-chain": "error",
      // alt-text
      "jsx-a11y/alt-text": "error",
      // labels-controls
      "jsx-a11y/label-has-associated-control": "error",
      // no-accesskey-autofocus
      "jsx-a11y/no-access-key": "error",
      "jsx-a11y/no-autofocus": "error",
      // lang-attribute
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/lang": "error",
      // autocomplete-valid
      "jsx-a11y/autocomplete-valid": "error",
      // click-keyboard
      "jsx-a11y/click-events-have-key-events": "error",
      // eslint-a11y-ci is carried by jsxA11y.configs["flat/strict"] above:
      // the strict preset is enabled and CI treats lint errors as build
      // failures. strict-mode (tsconfig "strict": true) and
      // coverage-thresholds (vitest.config.ts) are not eslint-enforceable;
      // their rules stay in rules/typescript.md and rules/vitest.md.
    },
  },
);
