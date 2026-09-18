---
priority: P0
category: accessibility
---

# Enable eslint-plugin-jsx-a11y in Strict Mode

**Do**: Install `eslint-plugin-jsx-a11y` and include it in your ESLint config with the `strict` preset. Treat a11y lint errors as build failures in CI.

**Avoid**: Disabling jsx-a11y rules individually to silence errors. Using only the `recommended` preset when `strict` catches more issues.

**Example**:
```js
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  jsxA11y.configs["flat/strict"],
  // ...other configs
];

// CI: fail build on a11y violations
// "lint": "eslint . --max-warnings 0"
```
