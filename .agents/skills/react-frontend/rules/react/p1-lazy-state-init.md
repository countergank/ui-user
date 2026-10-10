---
priority: P1
category: react
---

# Lazy-Initialize Expensive State

**Do**: Pass a function to `useState` when the initial value requires expensive computation, parsing, or construction. The function runs only once during initial render.

**Avoid**: Calling expensive functions directly in `useState()` — they execute on every render even though the result is discarded.

**Example**:
```tsx
// Correct: lazy initialization — runs once
const [data, setData] = useState(() => parseJSON(localStorage.getItem("cache")));
const [map] = useState(() => new WeakMap());

// Wrong: expensive call on every render
const [data, setData] = useState(parseJSON(localStorage.getItem("cache")));
```
