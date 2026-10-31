# React — Priority P0

Rules for components and hooks, ordered by priority. P0 rules apply to every change; P1 rules apply when the task touches effects, rendering cost, or update urgency.

## P0 — Use stable list keys

Use a stable, unique identifier from the data as each element's `key`. Keys must be unique among siblings and consistent across renders so React can match elements between renders.

```tsx
// ✅ Stable unique ID from the data
{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}
```

```tsx
// ❌ Index key remounts rows on reorder, filter, or insert
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}
```

A key generated during render (`crypto.randomUUID()`) remounts the element every render — the same failure as an index key.

## P0 — Pass `ref` as a regular prop on React 19+

React 19 takes `ref` as a regular prop: declare it in the props type as `Ref<T>` and forward it like any other prop. React 18 and earlier requires `forwardRef()`, because passing `ref` as a prop there silently fails to attach it.

```tsx
// ✅ React 19+ — ref as a regular prop
import type { Ref } from "react";

interface InputProps {
  label: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, ref }: InputProps) {
  return (
    <label>
      {label}
      <input ref={ref} type="text" />
    </label>
  );
}
```

```tsx
// ❌ React 18 and earlier — ref as a prop never attaches
export function Input({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} />; // ref stays null; wrap in forwardRef() instead
}
```

## P1 — Clean up effects

Return a cleanup function from every `useEffect` that subscribes to an external resource: subscriptions, event listeners, and timers. The cleanup runs before the effect re-runs and on unmount.

```tsx
// ✅ Every subscription and listener is removed on cleanup
useEffect(() => {
  const sub = eventSource.subscribe(setData);
  const handler = () => setOnline(navigator.onLine);
  window.addEventListener("online", handler);
  return () => {
    sub.unsubscribe();
    window.removeEventListener("online", handler);
  };
}, []);
```

```tsx
// ❌ Timer keeps firing after unmount — memory leak
useEffect(() => {
  setInterval(poll, 5000);
}, []);
```

React does not clean up side effects on its own; every acquired resource needs its matching release.

## P1 — Memoize only when measured

Use `useMemo` and `useCallback` after React DevTools Profiler identifies an expensive re-render or a referential instability causing downstream re-renders.

```tsx
// ✅ Memoized because profiling showed the sort is expensive
const sortedItems = useMemo(
  () => items.sort((a, b) => a.priority - b.priority),
  [items],
);
```

```tsx
// ❌ Premature memoization — the overhead exceeds the recompute cost
const label = useMemo(() => `Item ${count}`, [count]);
```

Memoization itself costs time and memory; measure first, then optimize the hot paths.

## P1 — Keep urgent updates out of transitions

Use `useTransition` to mark non-urgent updates (filtering, sorting, tab switches) so urgent ones (typing, clicks) render immediately, and `useDeferredValue` to defer rendering of an expensive subtree until idle.

```tsx
// ✅ Input stays responsive; the filter can be interrupted
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setQuery(e.target.value); // urgent
  startTransition(() => {
    setFilter(e.target.value); // non-urgent
  });
}
const deferredQuery = useDeferredValue(query);
```

```tsx
// ❌ Transition on urgent input makes typing feel laggy
startTransition(() => setQuery(e.target.value));
```

Keep form submission and navigation urgent — wrap only updates that can be interrupted without confusing the user.
