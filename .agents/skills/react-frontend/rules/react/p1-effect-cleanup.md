---
priority: P1
category: react
---

# Clean Up Effects Properly

**Do**: Return a cleanup function from `useEffect` for every subscription, event listener, timer, or external resource. The cleanup runs before the effect re-runs and on unmount.

**Avoid**: Leaving subscriptions active after unmount. Creating timers or listeners without cleanup. Assuming React automatically cleans up side effects.

**Example**:
```tsx
// Correct: cleanup subscription and listener
useEffect(() => {
  const sub = eventSource.subscribe(data => setData(data));
  const handler = () => setOnline(navigator.onLine);
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);

  return () => {
    sub.unsubscribe();
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}, []);

// Wrong: no cleanup — memory leak
useEffect(() => {
  const timer = setInterval(poll, 5000);
  // missing return () => clearInterval(timer);
}, []);
```
