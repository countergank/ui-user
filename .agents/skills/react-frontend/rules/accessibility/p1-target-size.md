---
priority: P1
category: accessibility
---

# Provide Minimum Touch Target Sizes

**Do**: Ensure interactive elements have a minimum target size of 24×24px (WCAG 2.5.8 Level AA). This 24px minimum is the normative floor; 44×44px is the recommended target (WCAG 2.5.5 Level AAA). Use padding, min-width, and min-height to expand small targets without changing visual design. See `rules/css-responsive/p1-touch-friendly.md` for the recommended 44px touch-target guidance.

**Avoid**: Placing interactive elements closer than 24px apart. Using tiny icon-only buttons without padding.

**Example**:
```css
/* Correct: minimum 24×24px touch target */
.icon-button {
  min-width: 24px;
  min-height: 24px;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Correct: adequate spacing between targets */
.nav-link {
  padding: 8px 12px;
  margin: 4px;
}

/* Wrong: target too small */
.close-btn {
  width: 16px;
  height: 16px;
  padding: 0;
}
```
