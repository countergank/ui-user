---
priority: P1
category: react
---

# Use Transitions for Non-Urgent Updates

**Do**: Use `useTransition` to mark non-urgent state updates (filtering, sorting, tab switches) so urgent updates (typing, clicks) are not blocked. Use `useDeferredValue` to defer rendering of expensive subtrees until idle.

**Avoid**: Using transitions for urgent user input. Wrapping every state update in `startTransition`.

**Example**:
```tsx
// Correct: transition for non-urgent filter
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState("");

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setQuery(e.target.value); // urgent — updates input immediately
  startTransition(() => {
    setFilter(e.target.value); // non-urgent — can be interrupted
  });
}

// Correct: defer expensive rendering
const deferredQuery = useDeferredValue(query);
<SearchResults query={deferredQuery} />
```
