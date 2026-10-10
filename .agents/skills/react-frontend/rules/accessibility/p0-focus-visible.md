---
priority: P0
category: accessibility
---

# Style Focus Visible for Keyboard Users

**Do**: Provide a visible focus indicator using `:focus-visible`. Never use `outline: none` without an equivalent replacement. Ensure focus is distinguishable from the background with at least 3:1 contrast ratio.

**Avoid**: Removing focus outlines globally with `*:focus { outline: none }`. Relying on color alone to indicate focus.

**Example**:
```css
/* Correct: visible focus-visible indicator */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Correct: ring alternative */
a:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
}

/* Wrong: removes all focus indication */
*:focus { outline: none; }
```
