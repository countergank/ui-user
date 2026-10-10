---
priority: P1
category: css-responsive
---

# Use Fluid Typography with clamp()

**Do**: Use `clamp()` to create font sizes that scale smoothly between a minimum and maximum based on viewport width. This eliminates the need for breakpoint-based font size overrides.

**Avoid**: Hardcoded font sizes at every breakpoint. Using `calc()` with viewport units without min/max bounds (can become illegible).

**Example**:
```css
/* Correct: fluid between 1rem and 2rem */
h1 {
  font-size: clamp(1rem, 2.5vw + 0.5rem, 2rem);
}

/* Correct: fluid heading scale */
:root {
  --text-sm: clamp(0.8rem, 1.5vw + 0.3rem, 0.9rem);
  --text-base: clamp(1rem, 2vw + 0.5rem, 1.25rem);
  --text-lg: clamp(1.25rem, 2.5vw + 0.75rem, 1.75rem);
  --text-xl: clamp(1.5rem, 3vw + 1rem, 2.5rem);
}

/* Wrong: no bounds — too small on mobile, too large on desktop */
h1 { font-size: 5vw; }
```
