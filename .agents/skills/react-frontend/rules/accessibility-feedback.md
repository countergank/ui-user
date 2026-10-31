# Accessibility Feedback — Priority P1

Color, motion, and live-announcement rules: how the UI communicates state.

## P1 — Maintain sufficient color contrast

Keep a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold); non-text UI components and graphical objects need 3:1 against adjacent colors. Verify with automated tools such as axe or a contrast checker.

```css
/* ✅ Passes WCAG AA 4.5:1 */
.text-body { color: #374151; background: #ffffff; } /* 8.6:1 */
```

```css
/* ❌ 2.85:1 — fails WCAG AA for body text */
.text-muted { color: #9ca3af; background: #ffffff; }
```

## P1 — Pair color with a second cue

Convey state with at least two channels: color plus an icon, text label, pattern, or underline. Color enhances meaning; a second cue carries it.

```tsx
// ✅ Color + icon + text carry the error together
{hasError && (
  <span className="error-message">
    <AlertIcon /> Please enter a valid email
  </span>
)}
```

```tsx
// ❌ Border color alone signals the error
<input style={{ borderColor: hasError ? "red" : "gray" }} />
```

Users with low vision or color vision deficiency miss color-only signals; marking required fields and active states needs the same second channel.

## P1 — Respect prefers-reduced-motion

Wrap animations and transitions in a `@media (prefers-reduced-motion: reduce)` block that provides a non-animated alternative or significantly reduced motion.

```css
/* ✅ Motion honors the user preference */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

.sidebar { animation: slideIn 0.3s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .sidebar { animation: none; transform: translateX(0); }
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

```css
/* ❌ Parallax runs regardless of the preference */
.hero { animation: parallax 2s infinite; }
```

The global reduction inside the same media query covers long-running animations the per-element overrides may miss.

## P1 — Announce route changes

Announce the page title after client-side navigation with `aria-live="polite"` and a ~100ms delay so the announcement reads the updated DOM. Copy `assets/RouteAnnouncer.tsx` from this skill into the app and render it once at the root.

```tsx
// ✅ RouteAnnouncer at the app root (see assets/RouteAnnouncer.tsx)
import { RouteAnnouncer } from "@/components/RouteAnnouncer";

function App() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  return (
    <>
      <Routes>{/* app routes */}</Routes>
      <RouteAnnouncer message={`${title} page loaded`} />
    </>
  );
}
```

```tsx
// ❌ Silent route transition — screen reader users never learn the page changed
<Routes>{/* app routes */}</Routes>
```

Keep the announcement polite: `aria-live="assertive"` interrupts whatever the screen reader is currently reading.

## P2 — Announce dynamic updates with live regions

Mark regions that update without a page reload with `aria-live="polite"`, use `role="status"` for non-critical updates, and `role="alert"` for important notifications.

```tsx
// ✅ Polite live region reports result counts
function SearchResults({ results }: { results: string[] }) {
  return (
    <div aria-live="polite" role="status">
      {results.length === 0
        ? "No results found"
        : `${results.length} results found`}
    </div>
  );
}
```

```tsx
// ❌ Content changes invisibly to screen readers
<div>{results.length} results found</div>
```

## P2 — Associate form errors with inputs

Link each validation error to its input with `aria-describedby`, set `aria-invalid="true"` on failure, and render the error container with `role="alert"` so screen readers announce it.

```tsx
// ✅ Error text is announced and tied to the input
<input
  id="email-input"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert" className="error">{error}</p>
)}
```

```tsx
// ❌ Visual-only error — assistive tech never hears it
<input type="email" />
{error && <p className="error">{error}</p>}
```

