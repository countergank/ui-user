---
priority: P1
category: performance
---

# Defer Third-Party Scripts Until After Hydration

**Do**: Load analytics, chat widgets, and other third-party scripts after the main app has hydrated. Use `requestIdleCallback`, `setTimeout`, or dynamic imports to delay non-critical scripts.

**Avoid**: Blocking hydration with third-party scripts. Loading analytics synchronously in `<head>`.

**Example**:
```tsx
// Correct: defer after hydration
useEffect(() => {
  const id = requestIdleCallback(() => {
    const script = document.createElement("script");
    script.src = "https://analytics.example.com/tracker.js";
    script.async = true;
    document.head.appendChild(script);
  });
  return () => cancelIdleCallback(id);
}, []);

// Correct: dynamic import for chat widget
useEffect(() => {
  import("./ChatWidget").then(({ init }) => init());
}, []);
```
