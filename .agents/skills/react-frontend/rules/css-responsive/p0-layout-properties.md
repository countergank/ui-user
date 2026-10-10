---
priority: P0
category: css-responsive
---

# Use CSS Logical Properties for Layout

**Do**: Use logical properties (`margin-inline`, `padding-block`, `text-align: start`) instead of physical directions (`margin-left`, `padding-top`). This ensures correct rendering in RTL languages.

**Avoid**: Hardcoding `left`/`right` for spacing and alignment. Using `float: left` for layout direction.

**Example**:
```css
/* Correct: logical properties */
.card {
  padding-inline: 1.5rem;
  padding-block: 1rem;
  margin-inline-start: auto;
  text-align: start;
  border-inline-start: 3px solid var(--accent);
}

/* Wrong: physical properties break in RTL */
.card {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  margin-left: auto;
  text-align: left;
  border-left: 3px solid var(--accent);
}
```
