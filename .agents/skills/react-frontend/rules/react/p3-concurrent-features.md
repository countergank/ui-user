---
priority: P3
category: react
---

# Use Concurrent Features Judiciously

**Do**: Use `useTransition`, `useDeferredValue`, and `<Suspense>` for non-blocking UI updates. Mark state updates that can be interrupted with `startTransition`.

**Avoid**: Using concurrent features for every state update. Wrapping critical user interactions (form submission, navigation) in transitions.

**Example**:
```tsx
// Correct: defer expensive search filtering
function SearchPage() {
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useDeferredValue(query);
  const results = useSearch(deferredQuery); // expensive computation

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults results={results} />
    </>
  );
}

// Correct: transition for non-urgent tab switch
function Tabs() {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("overview");

  const switchTab = (tab: string) => {
    startTransition(() => setActiveTab(tab));
  };

  return (
    <>
      <TabBar active={activeTab} onSelect={switchTab} />
      {isPending && <Spinner />}
      <TabContent tab={activeTab} />
    </>
  );
}
```
