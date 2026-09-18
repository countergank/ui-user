# Accessibility Policy

> Why: accessibility is a CI-enforced property of this template, not a feature. Every app
> built from it ships the same WCAG 2.2 AA baseline for keyboard and screen-reader users.

## What ships by default

| Guarantee | Where |
|-----------|-------|
| Page language declared (`<html lang="en">`) | `src/index.html` |
| Semantic landmarks `<header>`/`<nav>`/`<main>`/`<footer>` | `src/app-shell.tsx` |
| Skip link as the first Tab stop → `#main-content` | `src/app-shell.tsx` + `.skip-link` in `src/styles/index.css` |
| Route changes announced to screen readers | `src/components/a11y/route-announcer.tsx` (aria-live polite) |
| Focus parked on the content landmark after client navigation | `src/hooks/use-focus-management.ts` |
| Visible focus rings on interactive elements | `focus-visible:ring-2` in `button.tsx` and nav links |
| Reduced-motion respected | `prefers-reduced-motion` override in `src/styles/index.css` |
| Error states announced | `role="alert"` in `src/components/error/error-view.tsx` |

## The shell walkthrough — `src/app-shell.tsx`

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

The shell is rendered as the root layout route, so every routed page inherits landmarks, the
skip link, the announcer, and focus management without extra work.

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

## Rule of thumb checklist

- [ ] Interactive controls have visible labels/text (never rely on color or icon alone)
- [ ] Keyboard-only path works before a mouse ever touches it
- [ ] Route changes are announced; focus lands somewhere sensible
- [ ] Motion is optional — check with `prefers-reduced-motion: reduce`
- [ ] New pages pass `pnpm lint`, `pnpm test`, and the e2e axe scans