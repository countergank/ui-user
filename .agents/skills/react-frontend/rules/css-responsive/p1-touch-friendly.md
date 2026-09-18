---
priority: P1
category: css-responsive
---

# Design Touch-Friendly Interfaces

**Do**: Provide a minimum 44×44px tap target for all interactive elements on touch devices. Use `touch-action: manipulation` to eliminate the 300ms tap delay on buttons and links.

**Avoid**: Small tap targets that require precise finger placement. Using `touch-action: none` on interactive elements (breaks touch).

**Example**:
```css
/* Correct: adequate tap target + fast touch response */
.btn {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
  touch-action: manipulation;
}

/* Correct: touch-friendly spacing between items */
.nav-item {
  padding: 12px 8px;
  margin: 4px 0;
}

/* Wrong: too small for touch */
.icon-link {
  width: 20px;
  height: 20px;
  padding: 2px;
}
```
