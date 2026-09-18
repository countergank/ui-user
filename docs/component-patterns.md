# Component Patterns

> Why: every component in this template follows the same boundaries so apps built from it
> stay consistent: containers wire data, presentational components render, primitives stay
> dumb, and tests live next to the code.

## The container/presentational boundary

A **container** owns data fetching, state, and orchestration, then hands plain props to
**presentational** components. Presentational components never fetch data or touch the router;
they render props. This keeps the UI easy to test and reuse.

Real example — the home feature (`src/features/home/home-page.tsx`):

```tsx
export function HomePage() {
  const greeting = useGreeting();
  const { data, isPending, isError, error, refetch } = useHighlights();

  if (isPending) {
    return <p aria-busy="true">Loading highlights…</p>;
  }

  if (isError) {
    return (
      <ErrorView
        title="Could not load template highlights"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Hero title={`${greeting}! This is the standard frontend template`} subtitle="…" />
      <FeatureCards features={data} />
    </div>
  );
}
```

`Hero` and `FeatureCards` receive everything via props — `Hero` ({ title, subtitle, children })
simply renders, proving the pattern by example.

## Feature grouping

Everything for a capability lives under `src/features/<feature>/`:

```
src/features/home/
├─ api.ts            # typed TanStack Query hooks + query keys
├─ home-page.tsx     # container
├─ components/       # presentational components (+ colocated tests)
└─ hooks/            # feature-scoped custom hooks (+ colocated tests)
```

`api.ts` exports typed hooks (e.g. `useHighlights`) backed by TanStack Query; feature
components consume those hooks and never call `fetch` directly.

## shadcn/ui primitives

Shared primitives that encode the design system live in `src/components/ui/`. They are
shadcn-owned: `forwardRef`, `displayName`, CVA variants, and `cn()` composition — see
`src/components/ui/button.tsx`:

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
```

Use these primitives to compose feature components; extend the design system by adding a new
primitive here, not a one-off styled tag.

## Colocated tests

Every component keeps its test next to it (`<name>.test.tsx`). This is configured in
`vitest.config.ts` (`include: ["src/**/*.{test,spec}.{ts,tsx}"]`), so no extra wiring is
needed:

```
src/features/home/components/hero.tsx        # the component
src/features/home/components/hero.test.tsx   # its test
```

## Role-based queries

Tests assert user-facing semantics (roles + names), never implementation details like CSS
classes or test ids. Real example from `hero.test.tsx`:

```tsx
expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/about");
```

## State management policy

Three state layers, each with a designated owner. See ADR-10 (`docs/adr.md`).

| State kind | Tool | Where it lives |
|------------|------|----------------|
| Cross-component UI state (sidebar, theme, dialogs) | **Zustand** | `src/stores/` (bound hooks + external selectors) |
| Server data + cache | **TanStack Query** | `src/features/<feature>/api.ts` |
| True component-local state | `useState` / `useReducer` | Inside the component |

Zustand stores follow the v5 pattern in `src/stores/use-ui-store.ts`: a vanilla
`createStore` + exported `initialState` + standalone external selectors + a bound
`useUiStore` hook via `useStore(store, selector)`. Consumers subscribe to slices through
selectors so they only re-render when their slice changes.

```tsx
const theme = useUiStore(selectTheme);
const toggleTheme = useUiStore((s) => s.toggleTheme);
```

**No forced migration**: existing `useState`/`useReducer` local hooks remain valid and are
not required to move to Zustand. Server state always stays on TanStack Query. Store resets
between tests follow the convention in `src/test/setup.ts` (register each store's
`initialState` reset there).

## Rule of thumb checklist

- [ ] Container decides; presentational component renders props
- [ ] Feature logic extracted into custom hooks (`hooks/`) or query hooks (`api.ts`)
- [ ] Design-system primitives only in `src/components/ui/`
- [ ] Test colocated, named `<component>.test.tsx`
- [ ] Queries are role/name-based from the user's perspective
- [ ] Keyboard and screen-reader usability checked before merge (see
  [accessibility.md](accessibility.md))