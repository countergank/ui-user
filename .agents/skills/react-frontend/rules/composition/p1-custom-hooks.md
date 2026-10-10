---
priority: P1
category: composition
---

# Extract Custom Hooks for Reusable Logic

**Do**: Extract shared component logic into custom hooks when the same pattern appears in 2+ components. Custom hooks must call at least one React hook internally. Name them with the `use` prefix.

**Avoid**: Creating custom hooks that don't call any React hooks (use a plain function instead). Extracting logic used in only one component prematurely.

**Example**:
```tsx
// Correct: custom hook with React hooks
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage in multiple components
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  // ...
}

// Wrong: no React hook called — use a plain function
function useFormatDate(date: Date) {
  return date.toLocaleDateString(); // no hooks inside
}
```
