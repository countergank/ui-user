---
priority: P2
category: css-responsive
---

# Centralize Breakpoint Values

**Do**: Define breakpoint values as CSS custom properties for consistency and themeability. Note the real mechanism: media queries cannot read `var()` — they require literal lengths — so custom properties carry the values inside rules only (or feed a preprocessor/CSS-in-JS mixin that emits literal `@media` queries from the same source).

**Avoid**: Hardcoded breakpoint values scattered across files. Inconsistent breakpoint names (`768px` vs `767px` vs `sm`).

**Example**:
```css
/* Correct: centralized breakpoint tokens */
:root {
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}

/* Media queries use literal lengths (var() is invalid in @media);
   --bp-* tokens document the values consumed inside rules */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Wrong: magic numbers scattered across files */
@media (min-width: 767px) { ... }  /* off by one */
@media (min-width: 768px) { ... }  /* same intent, different value */
```
