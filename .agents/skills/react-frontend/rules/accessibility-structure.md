# Accessibility Structure — Priority P0

Semantics, focus, and target-size rules: how the DOM is shaped for assistive technology.

## P0 — Use semantic HTML elements

Use the element that carries the meaning: `<nav>` for navigation, `<main>` for primary content, `<article>` for self-contained content, `<button>` for actions, `<a>` for navigation. Define page regions with `<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`, and `<section>`, and add `aria-label` when multiple landmarks of the same type exist.

```tsx
// ✅ Semantic elements and landmarks structure the page
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <nav aria-label="Main navigation">{/* links */}</nav>
      </header>
      <main id="main-content">{children}</main>
      <footer>
        <nav aria-label="Footer navigation">{/* links */}</nav>
      </footer>
    </>
  );
}
```

```tsx
// ❌ Divs with roles and handlers imitate what HTML already provides
<div className="nav" onClick={navigate}>About</div>
<div role="main">...</div>
```

One visible `<main>` per page gives screen reader users a single landmark to jump to; ARIA roles add semantics only where no semantic element exists.

## P0 — Provide a visible focus indicator

Style `:focus-visible` with an indicator that stands out from the background (at least 3:1 contrast). Keep the default outline, or replace it with a box-shadow or ring of equivalent visibility.

```css
/* ✅ Visible focus indicator for keyboard users */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

a:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
}
```

```css
/* ❌ Removes all focus indication */
*:focus { outline: none; }
```

## P1 — Provide minimum touch target sizes

Give interactive elements a target size of at least 24×24px (WCAG 2.5.8 Level AA, the normative floor) and aim for 44×44px (WCAG 2.5.5 Level AAA) on touch devices. Use padding, `min-width`, and `min-height` to expand small targets, and `touch-action: manipulation` on buttons and links to remove the 300ms tap delay.

```css
/* ✅ Adequate target size and fast touch response */
.btn {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
  touch-action: manipulation;
}
```

```css
/* ❌ Requires precise finger placement */
.icon-link {
  width: 20px;
  height: 20px;
  padding: 2px;
}
```

## P2 — Include a skip-to-content link

Place a skip-to-content link as the first focusable element in the page, targeting the `<main>` element, and reveal it on focus.

```tsx
// ✅ First focusable element, visible when focused
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<style>{`
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px 16px;
    background: #000;
    color: #fff;
    z-index: 100;
  }
  .skip-link:focus { top: 0; }
`}</style>

<main id="main-content">{/* page content */}</main>
```

```tsx
// ❌ display: none removes the link from the tab order
<a href="#main-content" style={{ display: "none" }}>Skip to main content</a>
```

Positioning the link off-screen until focus is the standard pattern; hiding it with `display: none` makes it unreachable by keyboard.
