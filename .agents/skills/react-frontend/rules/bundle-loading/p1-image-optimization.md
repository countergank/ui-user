---
priority: P1
category: bundle-loading
---

# Optimize Images with Dimensions and Lazy Loading

**Do**: Always specify `width` and `height` attributes on images to prevent layout shift. Use `loading="lazy"` for below-the-fold images and `decoding="async"` to avoid blocking the main thread.

**Avoid**: Images without dimensions (causes Cumulative Layout Shift). Lazy-loading above-the-fold images (delays LCP).

**Example**:
```tsx
// Correct: dimensions + lazy + async decoding
<img
  src="/hero.jpg"
  width="1200"
  height="600"
  alt="Product showcase"
  loading="eager"    /* above the fold */
  decoding="async"
/>

<img
  src="/gallery-1.jpg"
  width="400"
  height="300"
  alt="Gallery item"
  loading="lazy"     /* below the fold */
  decoding="async"
/>

// Wrong: no dimensions — layout shift
<img src="/photo.jpg" alt="A photo" />

// Wrong: lazy above-the-fold — delays LCP
<img src="/hero.jpg" loading="lazy" alt="Hero" />
```
