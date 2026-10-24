# Accessibility Policy

> Why: accessibility is a CI-enforced property of this template, not a feature. Every app
> built from it ships the same WCAG 2.2 AA baseline for keyboard and screen-reader users.

## What ships by default

| Guarantee | Where |
|-----------|-------|
| Page language declared (`<html lang="en">`) | `src/index.html` |
| Semantic landmarks `<header>`/`<nav>`/`<main>`/`<footer>` | `src/public-layout.tsx` (public) and `src/features/console/dashboard-layout.tsx` (console) |
| Skip link as the first Tab stop → `#main-content` | both layouts + `.skip-link` in `src/styles/index.css` |
| Route changes announced to screen readers | `src/components/a11y/route-announcer.tsx` (aria-live polite) |
| Focus parked on the content landmark after client navigation | `src/hooks/use-focus-management.ts` |
| Visible focus rings on interactive elements | `focus-visible:ring-2` in `button.tsx` and nav links |
| Reduced-motion respected | `prefers-reduced-motion` override in `src/styles/index.css` |
| Error states announced | `role="alert"` in `src/components/error/error-view.tsx` |

## The shell walkthrough — `src/features/console/dashboard-layout.tsx`

```tsx
<a href="#main-content" className="skip-link">Skip to main content</a>

<RouteAnnouncer message={`${title} page loaded`} />

<header>
  <nav aria-label="Main navigation">…</nav>
</header>

<main id="main-content" ref={containerRef} tabIndex={-1}>
  <Suspense fallback={<p aria-busy="true">Loading page…</p>}>
    <Outlet />
  </Suspense>
</main>

<footer>…</footer>
```

The shell is a layout route, so every routed page inherits landmarks, the skip link, the
announcer, and focus management without extra work. Since ADR-13 there are **two** layout
routes and the split is at route level, not a conditional: `/`, `/about` and `/login` render
in `PublicLayout`, `/app/*` and `/profile` in `DashboardLayout`. The console shell adds a
sidebar (a static column on desktop, a focus-trapping `Sheet` drawer below `md`) and a topbar
with the language control, the theme control and the user menu. Collapsing the sidebar
removes it from the DOM rather than hiding it with CSS: a hidden-but-focusable navigation is
a keyboard trap.

## Focus management — `src/hooks/use-focus-management.ts`

On **client-side** navigation the hook parks focus on the `<main>` landmark
(`preventScroll`) so keyboard/screen-reader users restart from the page content. On the
**initial** load it deliberately does nothing: focus must start at the document body so the
skip link remains the first Tab stop.

## How it is enforced

| Gate | Tool | Where |
|------|------|-------|
| Static a11y lint | `eslint-plugin-jsx-a11y` (strict) | `eslint.config.js`, run by `pnpm lint` |
| Component a11y assertions | `vitest-axe` `toHaveNoViolations()` | colocated tests + `src/test/axe-pipeline.test.tsx` |
| Automated axe scans in a real browser | `@axe-core/playwright` | `e2e/critical-journeys.spec.ts` |
| Keyboard journeys | Playwright (Tab order, skip link, focus) | `e2e/critical-journeys.spec.ts` |

The axe probe in `src/test/axe-pipeline.test.tsx` deliberately renders a missing-alt image
and asserts `image-alt` IS reported — proving the runner can detect violations instead of
passing vacuously.

## Design tokens and contrast

The token palette in `src/styles/tokens.css` is an **AA claim, not a taste choice**: every
tone/foreground pair and the destructive button are held at ≥ 4.5:1 in both themes.

`src/styles/tokens.test.ts` parses that CSS and **measures** the ratios, so the rule survives the
colours being edited; a pair that drops below the floor fails with the measured ratio and both hex
values. This is also the written record of why the values are what they are: the tokens carry no
comments (ADR: "no comments"), so the reasoning lives here and the numbers are enforced there.

## Rule of thumb checklist

- [ ] Interactive controls have visible labels/text (never rely on color or icon alone)
- [ ] Keyboard-only path works before a mouse ever touches it
- [ ] Route changes are announced; focus lands somewhere sensible
- [ ] Motion is optional — check with `prefers-reduced-motion: reduce`
- [ ] New pages pass `pnpm lint`, `pnpm test`, and the e2e axe scans