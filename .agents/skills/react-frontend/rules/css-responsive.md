# CSS Responsive — Priority P0

Styling and responsive layout rules, ordered by priority.

## P0 — Use logical properties for layout

Use logical properties (`margin-inline`, `padding-block`, `text-align: start`) instead of physical directions (`margin-left`, `padding-top`) so spacing and alignment follow the text direction and render correctly in RTL languages.

```css
/* ✅ Logical properties mirror correctly in RTL */
.card {
  padding-inline: 1.5rem;
  padding-block: 1rem;
  margin-inline-start: auto;
  text-align: start;
  border-inline-start: 3px solid var(--accent);
}
```

```css
/* ❌ Physical properties flip wrongly in RTL */
.card {
  padding-left: 1.5rem;
  margin-left: auto;
  text-align: left;
  border-left: 3px solid var(--accent);
}
```

## P0 — Design mobile-first with progressive enhancement

Write base styles for the smallest viewport and add complexity with `min-width` media queries as the viewport grows. Start from a single-column layout and enhance to multi-column at breakpoints.

```css
/* ✅ Mobile base, enhanced upward */
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
    padding: 2rem;
  }
}
```

```css
/* ❌ Desktop-first: base styles carry overrides the mobile path undoes */
.container {
  flex-direction: row;
  padding: 2rem;
}

@media (max-width: 767px) {
  .container {
    flex-direction: column;
    padding: 1rem;
  }
}
```

## P1 — Use container queries for component-level responsiveness

Use `@container` queries when a component's layout should adapt to its container rather than the viewport. Declare `container-type` on the parent and query against it.

```css
/* ✅ The card adapts to the space it is given */
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
```

```css
/* ❌ Media query assumes the viewport — breaks in a narrow sidebar */
@media (min-width: 400px) {
  .card { display: grid; }
}
```

Components that appear in multiple contexts (sidebar, main content, modal) are the signal for container queries; page-level layout still belongs to media queries.

## P2 — Centralize breakpoint values

Define breakpoint values as CSS custom properties so every stylesheet consumes the same source. Media queries cannot read `var()` — they require literal lengths — so the tokens document the values used inside rules, or feed a preprocessor/CSS-in-JS mixin that emits the literal `@media` queries from the same source.

```css
/* ✅ One set of breakpoint tokens, referenced everywhere */
:root {
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
}

/* Media queries use the literal length the token documents */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

```css
/* ❌ Magic numbers drift apart across files */
@media (min-width: 767px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
```
