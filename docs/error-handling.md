# Error Handling

> Why: the app never crashes on a raw thrown string and never renders an untrusted message
> blindly. The error model is typed, errors surface at known boundaries, and retry paths are
> first-class.

## 1. The typed error model — `src/lib/errors.ts`

All application errors are `Error` instances so they carry stack traces, support
`instanceof`, and work with React error boundaries.

```ts
export class AppError extends Error {
  readonly code?: string;
  readonly status?: number;
  // constructor(message, { code, status, cause })
}

export class DataFetchError extends AppError { /* used by data-fetching layers */ }
export class RouteError extends AppError { /* used by route loading/rendering */ }

export function toError(unknown: unknown): Error {
  if (unknown instanceof Error) return unknown;
  if (typeof unknown === "string") return new Error(unknown);
  return new Error("An unexpected error occurred.");
}
```

Rule: **never throw raw strings** — use `AppError` (or a subclass), and normalize anything
that crosses a boundary with `toError()`.

## 2. Route-level boundary — `src/routes/index.tsx` + `src/components/error/route-error-boundary.tsx`

The data router declares an `errorElement` for the whole app, so render/loader crashes land
in one place:

```tsx
export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, lazy: () => import("./home-route") },
      { path: "about", lazy: () => import("./about-route") },
    ],
  },
]);
```

`RouteErrorBoundary` reads `useRouteError()`, distinguishes React Router responses
(`isRouteErrorResponse`) from app errors, normalizes both, and renders `ErrorView`.

## 3. The error UI — `src/components/error/error-view.tsx`

One accessible presentation, announced to assistive technology and reused everywhere:

```tsx
<section role="alert" aria-live="assertive" className="…">
  <h2>{title}</h2>
  <p>{message}</p>
  {onRetry ? <Button variant="outline" onClick={onRetry}>Try again</Button> : null}
</section>
```

## 4. TanStack Query error paths — `src/features/home`

Server-data errors are handled in the container via Query's state machine
(`isPending` / `isError` / `data`), and `refetch` powers the retry:

```tsx
const { data, isPending, isError, error, refetch } = useHighlights();

if (isError) {
  return (
    <ErrorView title="Could not load template highlights" message={error.message}
      onRetry={() => void refetch()} />
  );
}
```

## 5. The demo failure path

`src/features/home/api.ts` includes a deliberate failure hook — navigating to `/#fail`
rejects with a typed error — so the whole path is exercised in `e2e/critical-journeys.spec.ts`:

```ts
if (typeof window !== "undefined" && window.location.hash === "#fail") {
  reject(new AppError("Demo failure", { code: "HIGHLIGHTS_UNAVAILABLE" }));
}
```

The e2e test asserts the `role="alert"` with "Could not load template highlights", removes
the failure cause, keyboard-activates **Try again**, and expects the page to recover.

## Rule of thumb checklist

- [ ] Exception sites throw typed `Error` subclasses, never strings
- [ ] Boundaries normalize unknowns through `toError()`
- [ ] Route-level crashes are covered by `errorElement`
- [ ] Query/loading errors render `ErrorView` with a retry that refetches
- [ ] Error copy is user-facing text, not a stack trace or dev-only message