---
priority: P2
category: accessibility
---

# Use aria-live for Dynamic Content

**Do**: Apply `aria-live="polite"` to regions that update dynamically without page reload. Use `role="status"` for non-critical updates and `role="alert"` for important notifications.

**Avoid**: Using `aria-live="assertive"` for non-urgent updates (interrupts screen reader). Updating content without any live region announcement.

**Example**:
```tsx
// Correct: polite live region for status updates
function SearchResults({ results }: { results: string[] }) {
  return (
    <div aria-live="polite" role="status">
      {results.length === 0
        ? "No results found"
        : `${results.length} results found`}
      <ul>{results.map(r => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}

// Correct: alert for critical notifications
function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <div role="alert" aria-live="assertive">{message}</div>;
}
```
