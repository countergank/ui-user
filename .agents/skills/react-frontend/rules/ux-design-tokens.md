# UX Design Tokens — Priority P0

State coverage and theming rules.

## P0 — Cover loading, empty, and error states

Define three states for every async view: loading (skeleton or spinner), empty (an actionable message), and error (recoverable with a retry action). Treat them as first-class UI designed alongside the happy path.

```tsx
// ✅ All three states render intentionally
function DataView() {
  const { data, isLoading, error, refetch } = useQuery(...);

  if (isLoading) return <DataSkeleton rows={5} />;
  if (error) return <ErrorState message="Failed to load" onRetry={refetch} />;
  if (!data?.length) return <EmptyState action={<CreateButton />} />;

  return <DataTable items={data} />;
}
```

```tsx
// ❌ Blank screen while loading, raw error text on failure
function DataView() {
  const { data, isLoading, error } = useQuery(...);
  if (error) return <p>{error.message}</p>;
  return <DataTable items={data} />;
}
```

An empty state names the next step; an error state offers the retry — a bare message leaves the user stranded.

## P1 — Support dark mode with system preference detection

Use the `color-scheme` meta tag and the `prefers-color-scheme` media query so the UI respects the OS-level preference, and store an explicit toggle choice in `localStorage` with system preference as the fallback.

```html/css/ts
// ✅ Meta tag styles form controls and scrollbars; CSS respects the
// system preference; the stored toggle wins over the fallback
<meta name="color-scheme" content="light dark" />

:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --text: #111827;
}

@media (prefers-color-scheme: dark) {
  :root { --bg: #111827; --text: #f9fafb; }
}

function getPreferredTheme(): "light" | "dark" {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
```

```ts
// ❌ JavaScript detects the preference before CSS renders — the wrong
// theme flashes on first paint
const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark" : "light";
document.documentElement.dataset.theme = theme;
```
