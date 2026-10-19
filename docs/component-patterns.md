# Component Patterns

> Why: every component in this template follows the same boundaries so apps built from it
> stay consistent: containers wire data, presentational components render, primitives stay
> dumb, and tests live next to the code.

## The container/presentational boundary

A **container** owns data fetching, state, and orchestration, then hands plain props to
**presentational** components. Presentational components never fetch data or touch the router;
they render props. This keeps the UI easy to test and reuse.

Real example — the login feature (`src/features/auth/login-page.tsx`):

```tsx
export function LoginPage() {
  const { t } = useTranslation("auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-2xl font-semibold leading-none tracking-tight">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
```

The page owns the layout and the copy; `LoginForm` owns the mutation, the schema and the error
mapping, and reads the session through `useLogin` rather than receiving it as props. The
presentational half is the shadcn layer (`Card`, `Form`, `Alert`, `Input`, `Button`), which never
fetches, never routes and takes everything it renders as props.

## Feature grouping

Everything for a capability lives under `src/features/<feature>/`:

```
src/features/auth/
├─ api.ts               # transport: the request, no session logic
├─ hooks/use-login.ts   # feature-scoped hook: the mutation + session start
├─ login-page.tsx       # container: layout, copy, composition
├─ login-form.tsx       # container: form state, mutation, error mapping
├─ login-schema.ts      # pure validation, localized by factory
└─ login-errors.ts      # pure mapping from AppError to a message key
```

`api.ts` stays a plain request so it can be called without a store; the hook composes it with
`useMutation` and the session. Feature components consume those hooks and never call `fetch`
directly.

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
primitive here, not a one-off styled tag. The tokens these primitives consume — palette,
typography, spacing, radii, shadows, focus, and the "tokens only, never hex" rule — are
documented in [design-system.md](design-system.md); never hardcode a color in a component.

## Colocated tests

Every component keeps its test next to it (`<name>.test.tsx`). This is configured in
`vitest.config.ts` (`include: ["src/**/*.{test,spec}.{ts,tsx}"]`), so no extra wiring is
needed:

```
src/features/landing/landing-page.tsx        # the component
src/features/landing/landing-page.test.tsx   # its test
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
- [ ] Colors and spacing come from design tokens (see [design-system.md](design-system.md))
- [ ] Test colocated, named `<component>.test.tsx`
- [ ] Queries are role/name-based from the user's perspective
- [ ] Keyboard and screen-reader usability checked before merge (see
  [accessibility.md](accessibility.md))