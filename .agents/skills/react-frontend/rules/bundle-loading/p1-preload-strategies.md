---
priority: P1
category: bundle-loading
---

# Preload Resources on Hover or Focus

**Do**: Use `<link rel="preload">` or dynamic `import()` on hover/focus for routes or resources the user is likely to navigate to next. This bridges the gap between prefetch (eager) and on-demand (lazy).

**Avoid**: Preloading every possible next page on mount. Using `prefetch` for critical above-the-fold resources (use `preload` instead).

**Example**:
```tsx
// Correct: preload on hover for perceived speed
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

// Correct: resource hints in HTML
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
<link rel="preconnect" href="https://api.example.com" />
```
