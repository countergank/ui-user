---
priority: P1
category: accessibility
---

# Ensure Sufficient Color Contrast

**Do**: Maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold). Non-text UI components and graphical objects need 3:1 contrast against adjacent colors.

**Avoid**: Using light gray text on white backgrounds. Relying on visual inspection — use automated tools like axe or the Contrast Checker.

**Example**:
```css
/* Correct: passes WCAG AA 4.5:1 */
.text-body { color: #374151; background: #ffffff; } /* 8.6:1 */
.text-large { color: #595959; background: #ffffff; font-size: 1.125rem; } /* 4.54:1 */

/* Correct: UI component 3:1 */
.button { color: #ffffff; background: #2563eb; } /* 4.5:1 */

/* Wrong: fails contrast */
.text-muted { color: #9ca3af; background: #ffffff; } /* 2.85:1 — FAIL */
```
