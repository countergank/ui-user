---
priority: P1
category: css-responsive
---

# Design Touch-Friendly Interfaces

**Normative minimum**: interactive elements must have a target size of at least 24×24px (WCAG 2.5.8 Level AA). **Recommended target**: aim for 44×44px (WCAG 2.5.5 Level AAA) for all interactive elements on touch devices. Use `touch-action: manipulation` to eliminate the 300ms tap delay on buttons and links. See `rules/accessibility/p1-target-size.md` for the normative 24px rule.

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
