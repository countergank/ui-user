---
priority: P2
category: css-responsive
---

# Prevent Layout Shift on Responsive Changes

**Do**: Reserve space for dynamic content using aspect-ratio, min-height, or explicit dimensions. Use CSS transitions for size changes to avoid jarring jumps.

**Avoid**: Loading images or embeds without reserved space. Changing layout structure at breakpoints without smooth transitions.

**Example**:
```css
/* Correct: aspect-ratio reserves space before image loads */
.hero-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}

/* Correct: skeleton with min-height */
.card-content {
  min-height: 120px;
}

/* Correct: smooth transition on layout change */
.sidebar {
  width: 250px;
  transition: width 0.2s ease, opacity 0.2s ease;
}

@media (max-width: 768px) {
  .sidebar {
    width: 0;
    opacity: 0;
    overflow: hidden;
  }
}

/* Wrong: no space reserved — content jumps when image loads */
.hero-image {
  width: 100%;
  /* no height or aspect-ratio */
}
```
