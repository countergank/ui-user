---
priority: P0
category: ux-design-tokens
---

# Cover Loading, Empty, and Error States

**Do**: Every async view must define three states: loading (skeleton or spinner), empty (actionable message), and error (recoverable with retry). Treat these as first-class UI, not afterthoughts.

**Avoid**: Showing blank screens during loading. Displaying raw error messages to users. Empty states with no guidance on next steps.

**Example**:
```tsx
function DataView() {
  const { data, isLoading, error, refetch } = useQuery(...);

  if (isLoading) return <DataSkeleton rows={5} />;
  if (error) return <ErrorState message="Failed to load" onRetry={refetch} />;
  if (!data?.length) return <EmptyState action={<CreateButton />} />;

  return <DataTable items={data} />;
}
```
