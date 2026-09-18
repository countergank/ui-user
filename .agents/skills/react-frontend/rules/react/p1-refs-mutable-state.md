---
priority: P1
category: react
---

# Use Refs for Mutable Non-Render State

**Do**: Use `useRef` for values that change but should not trigger re-renders: timer IDs, DOM nodes, previous values, or mutable caches. Refs persist across renders without causing updates.

**Avoid**: Using `useState` for values that don't affect rendering. Reading `ref.current` during render (it may be stale).

**Example**:
```tsx
// Correct: ref for non-render state
function Timer() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const prevCountRef = useRef<number>();

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Track previous value without re-rendering
  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);
}

// Wrong: state for timer ID — unnecessary re-render
const [intervalId, setIntervalId] = useState<number>();
```
