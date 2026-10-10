---
priority: P3
category: accessibility
---

# Respect prefers-reduced-data

**Do**: Check `prefers-reduced-data` media query to reduce data-heavy features for users on constrained connections. Offer low-resolution images, defer non-critical resources, and disable auto-playing media.

**Avoid**: Loading heavy assets regardless of user preference. Assuming all users have fast, unmetered connections.

**Example**:
```css
/* Correct: reduce image quality when user prefers less data */
@media (prefers-reduced-data: reduce) {
  .hero-image {
    background-image: url("/images/hero-low-res.jpg");
  }
  .video-placeholder {
    display: block;
  }
  video {
    display: none;
  }
}

/* In React: conditional loading based on preference */
function ResponsiveImage({ src, lowResSrc, alt }: ImageProps) {
  const prefersReducedData = useMediaQuery(
    "(prefers-reduced-data: reduce)"
  );
  return (
    <img src={prefersReducedData ? lowResSrc : src} alt={alt} />
  );
}
```

**Reference**: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-data
