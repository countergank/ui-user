---
priority: P1
category: bundle-loading
---

# Prefetch Likely-Next Resources on Hover or Focus

**Do**: Use `<link rel="prefetch">` or dynamic `import()` on hover/focus for routes or resources the user is likely to navigate to next. This bridges the gap between eager loading and on-demand (lazy) loading. Reserve `<link rel="preload">` for critical resources needed on the current page (fonts, hero images, critical CSS).

**Avoid**: Prefetching every possible next page on mount. Using `preload` for likely-next navigation — `preload` is for critical same-page resources; `prefetch` is for likely-next navigation.

**Example**:
```tsx
// Correct: prefetch on hover for perceived speed
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleMouseEnter = () => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  };

  return (
    <a href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  );
}

// Correct: preload critical same-page resources; prefetch likely-next ones
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
<link rel="preconnect" href="https://api.example.com" />
```
