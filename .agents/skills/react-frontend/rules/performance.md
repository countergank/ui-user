# Performance — Priority P0–P3

Rendering and data-fetching rules, ordered by priority. P0 rules apply to every feature; P1–P3 apply when the task touches rendering cost, third-party scripts, or caching.

## P0 — Import directly instead of through barrels

Import from the source file path. A barrel `index.ts` that re-exports a whole directory forces the bundler to parse every module it reaches and blocks tree-shaking.

```ts
// ✅ Direct import from the source path
import { formatDate } from "@/utils/date/format";
```

```ts
// ❌ Barrel import pulls the whole utils tree into the graph
import { formatDate } from "@/utils"; // utils/index.ts re-exports 50+ modules
```

## P0 — Fetch independent data in parallel

Issue independent requests together with `Promise.all` (fail-fast) or `Promise.allSettled` (partial results), and group fetches that share one loading boundary.

```tsx
// ✅ Independent requests resolve concurrently
const [users, posts] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
]);
```

```tsx
// ❌ Sequential awaits stack the latencies
const users = await fetch("/api/users").then((r) => r.json());
const posts = await fetch("/api/posts").then((r) => r.json());
```

Keep dependent requests out of the same `Promise.all`: await the dependency first, then parallelize what remains.

## P0 — Place Suspense boundaries at feature level

Wrap each feature-level section in its own `<Suspense>` boundary, placed close to its data source, so one pending section never blocks unrelated UI.

```tsx
// ✅ Feature-level boundaries isolate loading states
<Suspense fallback={<DashboardSkeleton />}>
  <UserProfile />
</Suspense>
<Suspense fallback={<PostsSkeleton />}>
  <RecentPosts />
</Suspense>
```

```tsx
// ❌ A single root boundary blocks the whole page
<Suspense fallback={<AppLoader />}>
  <App />
</Suspense>
```

## P1 — Render below-fold content lazily

Apply `content-visibility: auto` with `contain-intrinsic-size` to long lists, feeds, or sections below the fold; the browser skips rendering off-screen content until it enters the viewport.

```css
/* ✅ Estimated size keeps the scrollbar stable */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 200px;
}
```

```css
/* ❌ Missing contain-intrinsic-size — the scrollbar jumps while scrolling */
.feed-item {
  content-visibility: auto;
}
```

Keep it below the fold: on above-the-fold content `content-visibility` causes layout shift.

## P1 — Defer third-party scripts until after hydration

Load analytics, chat widgets, and other third-party scripts after the app hydrates, using `requestIdleCallback`, `setTimeout`, or a dynamic import. Read the script URL from app config (`import.meta.env.VITE_*`), never hardcoded.

```tsx
// ✅ Idle-time injection after hydration
const TRACKER_SRC = import.meta.env.VITE_TRACKER_SRC;

useEffect(() => {
  const id = requestIdleCallback(() => {
    const script = document.createElement("script");
    script.src = TRACKER_SRC;
    script.async = true;
    document.head.appendChild(script);
  });
  return () => cancelIdleCallback(id);
}, []);
```

```tsx
// ❌ Synchronous third-party script in <head> blocks hydration
<script src={TRACKER_SRC} />
```

## P3 — Cache at the data layer

Configure `staleTime` and `gcTime` in TanStack Query so repeated views of the same data reuse the cache instead of refetching, and serve responses under the `Cache-Control` headers the API sets (`max-age` controls how long the browser reuses a response). Derive `staleTime` from how often the data actually changes; keep `gcTime` long enough to cover a user returning to a view within one session.

```ts
// ✅ Data-layer cache tuned to how the data changes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // reuse for 1 min before refetching
      gcTime: 300_000,   // keep unused data in cache for 5 min
    },
  },
});
```

```ts
// ❌ Refetching identical data on every mount — the cache is never used
useQuery({ queryKey: ["users"], queryFn: fetchUsers, staleTime: 0 });
```

Keep caching scope in the data layer (query client and HTTP headers); render-level deduplication belongs to server frameworks and does not apply to a Vite SPA.
