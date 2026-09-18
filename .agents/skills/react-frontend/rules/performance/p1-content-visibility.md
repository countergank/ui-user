---
priority: P1
category: performance
---

# Use content-visibility for Below-Fold Content

**Do**: Apply `content-visibility: auto` with `contain-intrinsic-size` to long lists, feeds, or sections below the fold. The browser skips rendering off-screen content until it enters the viewport.

**Avoid**: Using `content-visibility` on above-the-fold content (causes layout shift). Omitting `contain-intrinsic-size` (browser can't estimate scroll height).

**Example**:
```css
/* Correct: below-fold list with estimated size */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px; /* width height */
}

/* Correct: long article sections */
.article-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}

/* Wrong: no intrinsic size — scroll bar jumps */
.list-item {
  content-visibility: auto;
  /* missing contain-intrinsic-size */
}
```
