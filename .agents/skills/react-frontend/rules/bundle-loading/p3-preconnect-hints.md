---
priority: P3
category: bundle-loading
---

# Use Preconnect and DNS-Prefetch Hints

**Do**: Add `<link rel="preconnect">` for origins your app will definitely request resources from. Use `<link rel="dns-prefetch">` for third-party origins you may request later.

**Avoid**: Preconnecting to every external origin (wastes connection slots). Preconnecting for single, non-critical requests.

**Example**:
```html
<!-- Correct: preconnect for critical third parties -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://api.example.com" crossorigin />

<!-- Correct: dns-prefetch for optional origins -->
<link rel="dns-prefetch" href="https://analytics.example.com" />

<!-- In React app's index.html or head component -->
<head>
  <link rel="preconnect" href="https://cdn.example.com" />
  <link rel="dns-prefetch" href="https://maps.googleapis.com" />
</head>

<!-- Wrong: too many preconnects — browser limits to ~6 per origin -->
<link rel="preconnect" href="https://a.com" />
<link rel="preconnect" href="https://b.com" />
<link rel="preconnect" href="https://c.com" />
<!-- ... 10 more ... -->
```
