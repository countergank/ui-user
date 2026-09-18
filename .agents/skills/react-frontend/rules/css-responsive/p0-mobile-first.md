---
priority: P0
category: css-responsive
---

# Design Mobile-First with Progressive Enhancement

**Do**: Write base styles for the smallest viewport first. Add complexity with `min-width` media queries as viewport grows. Start with single-column layouts and enhance to multi-column at breakpoints.

**Avoid**: Writing desktop-first styles then overriding with `max-width` queries. Duplicating base styles inside every media query block.

**Example**:
```css
/* Correct: mobile-first */
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```
