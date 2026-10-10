---
priority: P0
category: react
---

# Follow Hooks Rules Strictly

**Do**: Call hooks at the top level of function components or custom hooks. Include all reactive values in dependency arrays. Clean up effects that subscribe to external resources.

**Avoid**: Calling hooks conditionally, inside loops, or after early returns. Omitting values from dependency arrays that the effect reads.

**Example**:
```tsx
// Correct: hooks at top level, complete deps, cleanup
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Wrong: conditional hook call
function ConditionalHook({ flag }: { flag: boolean }) {
  if (flag) {
    const [value, setValue] = useState(0); // BREAKS — hook inside condition
  }
}
```
