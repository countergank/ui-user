---
priority: P2
category: bundle-loading
---

# Code Split by Route

**Do**: Use `React.lazy()` with `import()` to load route-level components on demand. Wrap lazy components in `<Suspense>` with a meaningful fallback.

**Avoid**: Loading all route code in the initial bundle. Using lazy for tiny components that don't justify a separate chunk.

**Example**:
```tsx
// Correct: route-level code splitting
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}

// Wrong: all pages in initial bundle
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
```
