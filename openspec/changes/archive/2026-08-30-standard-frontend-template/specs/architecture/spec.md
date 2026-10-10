# Architecture — Standard Frontend Template

## ADDED Requirements

### ARCH-1: Feature-based structure
The template MUST use a feature-based (screaming) folder structure under `src/`:
`src/features/<feature>/` groups a feature's components, hooks, and logic, with shared
code in `src/components/` (presentational), `src/lib/`, and `src/hooks/`. Flat
layer-only organization is NOT allowed.

### ARCH-2: Component architecture (atomic + shadcn)
Reusable UI primitives MUST be composed with shadcn/ui components in a dedicated UI layer
(`src/components/ui/`). Feature-specific components MUST compose those primitives. Each
component MUST have a single responsibility (`comp-002` per skill).

### ARCH-3: Container/presentational split
The template MUST model the container/presentational pattern where it reduces coupling:
containers handle data/state wiring; presentational components receive props and render.
Hooks MUST be extracted for reusable logic (`comp-003` per skill).

### ARCH-4: Error handling
Errors MUST be represented as typed `Error` instances, not strings. The template MUST
include route-level error boundaries and a consistent pattern for handling data-fetching
errors through TanStack Query (query errors, retry, and error UI). `dangerouslySetInnerHTML`
MUST NOT be used except in explicitly sanctioned, justified cases (`react-011` per skill).

### ARCH-5: Data fetching & rendering
The template MUST use simultaneously-rendered Suspense boundaries and parallel fetching for
independent data. It MUST avoid barrel imports for hot paths and use dynamic import for
route-level code splitting (`perf-002`, `perf-003`, `bundle-001` per skill).

### ARCH-6: Shell and navigation
The template MUST define an application shell (layout, navigation, route announcer per
`a11y-*` route-announcer rule) that provides consistent landmarks, skip links, and focus
management.
