---
priority: P0
category: bundle-loading
---

# Split Code with Dynamic Imports

**Do**: Use `import()` to load route-level or feature-level code only when needed. Pair with React.lazy and Suspense for component-level splitting. Preload critical routes that users are likely to navigate to next.

**Avoid**: Bundling all routes into a single chunk. Dynamic-importing components used on every page load.

**Example**:
```tsx
// Correct: route-level code splitting
const SettingsPage = React.lazy(() => import("./pages/Settings"));
const AdminPage = React.lazy(() => import("./pages/Admin"));

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings" element={<Suspense fallback={<Loader />}><SettingsPage /></Suspense>} />
    </Routes>
  );
}
```
