---
priority: P2
category: accessibility
---

# Include Skip-to-Content Link

**Do**: Place a skip-to-content link as the first focusable element in the page. It should target the `<main>` element and become visible on focus.

**Avoid**: Hiding the skip link with `display: none` (removes from tab order). Placing it after other interactive elements.

**Example**:
```tsx
// Correct: first focusable, visible on focus
<a
  href="#main-content"
  className="skip-link"
>
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
  .skip-link:focus {
    top: 0;
  }
`}</style>

<main id="main-content">
  {/* page content */}
</main>
```
