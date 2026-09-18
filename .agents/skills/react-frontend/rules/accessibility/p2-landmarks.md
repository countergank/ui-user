---
priority: P2
category: accessibility
---

# Use Semantic Landmark Elements

**Do**: Use `<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`, and `<section>` to define page regions. Add `aria-label` when multiple landmarks of the same type exist.

**Avoid**: Using `<div>` with role attributes when semantic HTML elements are available. Having multiple `<main>` elements visible simultaneously.

**Example**:
```tsx
// Correct: semantic landmarks
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

// Wrong: divs with ARIA roles when semantic elements exist
<div role="banner">...</div>
<div role="main">...</div>
<div role="contentinfo">...</div>
```
