---
priority: P1
category: css-responsive
---

# Use Container Queries for Component-Level Responsiveness

**Do**: Use `@container` queries when a component's layout should adapt to its container size rather than the viewport. Define a `container-type` on the parent and query against it.

**Avoid**: Using `@media` queries for components that appear in multiple contexts (sidebar, main content, modal). Nesting container queries excessively.

**Example**:
```css
/* Correct: container query adapts to parent size */
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}

/* Wrong: media query assumes viewport, not container */
@media (min-width: 400px) {
  .card { display: grid; } /* breaks in narrow sidebar */
}
```
