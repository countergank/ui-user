---
priority: P0
category: composition
---

# Apply Single Responsibility to Components

**Do**: Each component should do one thing: display data, handle a form, manage a list, or orchestrate layout. Extract sub-components when a file exceeds 150 lines or handles multiple concerns.

**Avoid**: Components that fetch data, transform it, render UI, and handle side effects all in one file. God components that grow to handle every edge case.

**Example**:
```tsx
// Correct: separated concerns
// UserList.tsx — orchestration
export function UserList() {
  const { data, isLoading } = useUsers();
  if (isLoading) return <ListSkeleton />;
  if (!data?.length) return <EmptyState />;
  return <UserItems users={data} />;
}

// Wrong: single component does everything
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch... }, []);
  // 200 lines of rendering, filtering, sorting, pagination...
}
```
