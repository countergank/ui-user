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
    Component: PublicLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, lazy: () => import("./landing-route") },
      { path: "about", lazy: () => import("./about-route") },
    ],
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [{ index: true, Component: ConsolePlaceholder }],
  },
  { path: "/forbidden", Component: ForbiddenPage, errorElement: <RouteErrorBoundary /> },
]);
```

Every layout route declares its own `errorElement`, so a crash inside the console keeps the
console's shell and a crash on the public site keeps the public one.

The boundary has two exits, and neither is "something went wrong": a **403** (`isForbiddenError`,
`UA-SEC-002`) navigates to `/forbidden`, because a denial is an answer, not a failure to retry; and
a route guard (`RequireAuth`, `RequirePermission`) never throws at all — it redirects before the
protected route renders, so an authorization decision cannot end up in the error path.

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

## 4. Mutation error paths — `src/features/auth`

A failed mutation is the same typed envelope as any other request (`AppError` with `code` and
`status`), and the container is where it becomes copy. `login-errors.ts` keeps that decision pure
and testable, and `login-form.tsx` renders it once, under the form:

```tsx
const errorKey = resolveLoginError(loginMutation.error);
const rateLimited = errorKey === "login.errors.rateLimited";
const errorMessage =
  errorKey !== null ? t(errorKey) : loginMutation.isError ? tCommon("error.genericMessage") : null;
```

Query errors keep the same shape (`isPending` / `isError` / `refetch` in the container, `ErrorView`
for the retry surface), which is what the route error boundary and `ErrorView` continue to cover.

## 5. The real failure path is tested with MSW

There is no demo failure hook anymore: the failure paths that matter are the API's own
envelopes, and they are exercised against the real client in
`src/features/auth/login-page.integration.test.tsx` with MSW:

```ts
server.use(http.post(LOGIN_URL, () => apiFailure(401, "UA-AUTH-002")));
```

The suite asserts the `role="alert"` under the form, the field-level messages with their
`aria-describedby`, the focus on the first error, and that a 429 leaves the submit disabled.
Causality is honest: the test fails if the mapping, the transport or the alert regress.

## Rule of thumb checklist

- [ ] Exception sites throw typed `Error` subclasses, never strings
- [ ] Boundaries normalize unknowns through `toError()`
- [ ] Route-level crashes are covered by `errorElement`
- [ ] Query/loading errors render `ErrorView` with a retry that refetches
- [ ] Error copy is user-facing text, not a stack trace or dev-only message