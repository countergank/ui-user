---
priority: P0
category: performance
---

# Place Suspense Boundaries at Feature Level

**Do**: Wrap feature-level sections with `<Suspense>` to show loading states while async data resolves. Place boundaries as close to the data source as possible to avoid blocking unrelated UI.

**Avoid**: A single Suspense boundary at the app root (blocks everything). Wrapping individual atoms (buttons, inputs) with Suspense.

**Example**:
```tsx
// Correct: feature-level boundaries
<Suspense fallback={<DashboardSkeleton />}>
  <UserProfile />
</Suspense>
<Suspense fallback={<PostsSkeleton />}>
  <RecentPosts />
</Suspense>

// Wrong: root-level blocks all rendering
<Suspense fallback={<AppLoader />}>
  <App />
</Suspense>
```
