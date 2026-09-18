---
name: react-frontend
description: "Trigger: react, typescript, vite, vitest, frontend, spa, component, hook, css, a11y, accessibility, wcag. Modern React 19 frontend development with TypeScript 5, Vite, and Vitest — 87 WCAG 2.2-compliant rules across 10 categories."
license: MIT
metadata:
  author: countergank
  version: "1.0.0"
---

## When to Apply

Activate when building or modifying React SPAs: scaffolding components, writing hooks, configuring Vite/Vitest, styling with responsive CSS, enforcing accessibility (WCAG 2.2), optimizing bundle loading, or composing component architecture.

## Rule Categories by Priority

| Priority | Category | Count | Key Rules |
|----------|----------|-------|-----------|
| P0 | react | 5 | Server/client boundary, hooks rules, conditional rendering, key props |
| P0 | typescript | 2 | Strict mode, ESM imports |
| P0 | accessibility | 6 | Semantic HTML, labels/controls, alt text, focus-visible |
| P0 | vite | 2 | Path aliases, env variables |
| P0 | vitest | 2 | Test structure, Testing Library |
| P0 | css-responsive | 2 | Mobile-first, layout properties |
| P0 | performance | 3 | Parallel fetching, Suspense boundaries, barrel imports |
| P0 | composition | 2 | Compound components, single responsibility |
| P0 | bundle-loading | 1 | Dynamic imports |
| P0 | ux-design-tokens | 1 | State coverage |
| P1 | react | 6 | Refs, memoization, transitions, error boundaries, Suspense |
| P1 | typescript | 4 | Readonly props, error instances, nullish coalescing, as const |
| P1 | accessibility | 6 | Color contrast, target size, reduced motion, route announcer |
| P1 | vite | 2 | Build optimization, HMR config |
| P1 | vitest | 4 | Coverage thresholds, mock strategies, test colocation, userEvent |
| P1 | css-responsive | 3 | Container queries, fluid typography, touch-friendly |
| P1 | performance | 4 | Content visibility, serialization, React.cache, defer third-party |
| P1 | composition | 2 | Custom hooks, state lifting |
| P1 | bundle-loading | 2 | Preload strategies, image optimization |
| P1 | ux-design-tokens | 2 | Dark mode, i18n readiness |
| P2 | react | 2 | displayName, no dangerouslySetInnerHTML |
| P2 | typescript | 2 | Optional chaining, no non-null assertions |
| P2 | accessibility | 6 | Skip links, landmarks, aria-live, keyboard, form errors, autocomplete |
| P2 | vite | 2 | Proxy config, asset handling |
| P2 | vitest | 1 | Integration tests |
| P2 | css-responsive | 2 | Breakpoint custom props, layout shift prevention |
| P2 | performance | 2 | Hoist static JSX, Activity component |
| P2 | composition | 1 | Extract reusable components |
| P2 | bundle-loading | 1 | Code splitting by routes |
| P2 | ux-design-tokens | 1 | URL reflects state |
| P3 | react | 1 | Concurrent features |
| P3 | typescript | 1 | Declaration merging |
| P3 | accessibility | 1 | prefers-reduced-data |
| P3 | performance | 1 | Advanced caching strategies |
| P3 | bundle-loading | 1 | Preconnect hints |
| P3 | ux-design-tokens | 1 | Design token system |

**Totals**: 87 rules — 26 P0 + 35 P1 + 20 P2 + 6 P3 across 10 categories

## How to Use

1. **Agent loads this SKILL.md first** — the priority table identifies which categories apply to the current task.
2. **Navigate `rules/<category>/` by priority** — start with `p0-*.md` files (always loaded), then `p1-*.md` when context involves performance, testing, or advanced a11y.
3. **Each rule file is self-contained** — read the Do/Avoid/Example, apply the pattern, move on. No need to load all files.
4. **Reference `assets/` templates** when scaffolding new projects or updating build configuration.

## Quick Reference

| ID | Decision | Option A | Option B | When to choose |
|----|----------|----------|----------|----------------|
| `react-001` | Component type | Server Component | Client Component | Server by default; client only for interactivity/state |
| `a11y-001` | Element choice | Semantic HTML | ARIA div | Semantic HTML always; ARIA only when no semantic equivalent |
| `perf-001` | Data fetching | Promise.all | Sequential await | Always parallel when requests are independent |
| `css-001` | Responsive strategy | Mobile-first | Desktop-first | Mobile-first for performance; desktop only for admin dashboards |
| `bundle-001` | Code loading | Dynamic import | Static import | Dynamic per route; static for critical above-the-fold |
| `ts-001` | Type safety | strict: true | Partial strict | strict always; relax only with documented justification |
