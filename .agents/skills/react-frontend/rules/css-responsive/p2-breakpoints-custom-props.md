---
priority: P2
category: css-responsive
---

# Use CSS Custom Properties for Breakpoints

**Do**: Define breakpoint values as CSS custom properties for consistency and themeability. Use `@media` with `var()` references or a preprocessor mixin that reads from the same source.

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

/* Usage with CSS-in-JS or preprocessors */
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
