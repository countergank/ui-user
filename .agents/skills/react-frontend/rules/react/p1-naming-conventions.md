---
priority: P1
category: react
---

# Follow Consistent Naming Conventions

**Do**: Destructure state as `[value, setValue]` with the `set` prefix. Name event handlers with `handle` prefix (`handleClick`, `handleChange`). Name boolean state with `is`, `has`, or `should` prefix.

**Avoid**: Inconsistent naming like `[count, changeCount]` or `[data, updateData]`. Naming handlers `onClickFn` or `onPressCallback`.

**Example**:
```tsx
// Correct: consistent naming
const [isLoading, setIsLoading] = useState(false);
const [items, setItems] = useState<Item[]>([]);
const handleClick = () => { /* ... */ };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

// Wrong: inconsistent naming
const [loading, changeLoading] = useState(false);
const [data, modifyData] = useState([]);
const onClickFn = () => { /* ... */ };
```
