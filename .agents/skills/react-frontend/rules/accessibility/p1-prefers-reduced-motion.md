---
priority: P1
category: accessibility
---

# Respect Prefers-Reduced-Motion

**Do**: Wrap all CSS animations and transitions in `@media (prefers-reduced-motion: reduce)`. Provide non-animated alternatives or significantly reduce motion for users who prefer it.

**Avoid**: Ignoring user motion preferences. Using `animation` or `transition` without a reduced-motion fallback.

**Example**:
```css
/* Correct: respects user preference */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

.sidebar { animation: slideIn 0.3s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .sidebar {
    animation: none;
    transform: translateX(0);
  }
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Wrong: no reduced-motion fallback */
.hero { animation: parallax 2s infinite; }
```
