---
priority: P3
category: ux-design-tokens
---

# Build a Design Token System

**Do**: Define design tokens (colors, spacing, typography, shadows) as CSS custom properties in a single source of truth. Reference tokens consistently across components rather than hardcoded values.

**Avoid**: Hardcoding color hex values or spacing pixels in component styles. Duplicating token definitions across files.

**Example**:
```css
/* tokens.css — single source of truth */
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-surface: #ffffff;
  --color-text: #1f2937;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Typography */
  --font-sans: system-ui, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
}

/* Component uses tokens */
.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  font: var(--text-sm) var(--font-sans);
}

/* Wrong: hardcoded values */
.button {
  background: #2563eb;
  padding: 8px 16px;
  font-size: 14px;
}
```
