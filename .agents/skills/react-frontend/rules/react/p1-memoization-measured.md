---
priority: P1
category: react
---

# Memoize Only When Profiler Shows Benefit

**Do**: Use `useMemo` and `useCallback` only after React DevTools Profiler identifies expensive re-renders or referential instability causing downstream re-renders. Measure before optimizing.

**Avoid**: Wrapping every value in `useMemo` or every function in `useCallback` preemptively. The overhead of memoization can exceed the cost of recomputation for simple values.

**Example**:
```tsx
// Correct: memoize after profiling shows benefit
const sortedItems = useMemo(() => items.sort((a, b) => a.priority - b.priority), [items]);

const handleClick = useCallback((id: string) => {
  dispatch({ type: "SELECT", id });
}, [dispatch]);

// Wrong: premature memoization adds overhead
const label = useMemo(() => `Item ${count}`, [count]); // simple interpolation — no need
```
