---
priority: P2
category: ux-design-tokens
---

# URL Reflects Application State

**Do**: Sync important UI state (filters, pagination, selected tab, search query) with the URL using query parameters or route segments. Use `useSearchParams` or router state for SPA navigation.

**Avoid**: Storing navigable state only in component state. Breaking browser back/forward button behavior.

**Example**:
```tsx
// Correct: URL reflects filter state
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "all";
  const page = Number(searchParams.get("page")) ?? 1;

  const handleCategoryChange = (cat: string) => {
    setSearchParams({ category: cat, page: "1" });
  };

  return (
    <>
      <CategorySelector value={category} onChange={handleCategoryChange} />
      <Pagination page={page} />
    </>
  );
}

// Wrong: state lost on refresh / back button
const [category, setCategory] = useState("all");
```
