---
priority: P1
category: accessibility
---

# Announce Route Changes for Screen Readers

**Do**: Implement a `RouteAnnouncer` component that announces page title changes after client-side navigation. Use `aria-live="polite"` with a slight delay so the DOM updates before the announcement.

**Avoid**: Silent route transitions in SPAs. Using `aria-live="assertive"` for route changes (interrupts current speech).

**Example**:
```tsx
// Use the RouteAnnouncer asset template
import { RouteAnnouncer } from "@/assets/RouteAnnouncer";

function App() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <>
      <Routes>{/* app routes */}</Routes>
      <RouteAnnouncer message={`${title} page loaded`} />
    </>
  );
}

// Key: delay announcement by ~100ms so screen readers
// pick up the updated DOM, not the previous state.
```
