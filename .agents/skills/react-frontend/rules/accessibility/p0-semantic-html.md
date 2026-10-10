---
priority: P0
category: accessibility
---

# Use Semantic HTML Elements

**Do**: Use the correct HTML element for its intended meaning: `<nav>` for navigation, `<main>` for primary content, `<article>` for self-contained content, `<button>` for actions, `<a>` for navigation.

**Avoid**: Using `<div>` or `<span>` with click handlers and ARIA roles when a semantic element exists. `<div onClick>` instead of `<button>`.

**Example**:
```tsx
// Correct: semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
<main>
  <article>
    <h1>Post Title</h1>
    <button onClick={handleShare}>Share</button>
  </article>
</main>

// Wrong: divs with roles
<div className="nav" onClick={navigate}>About</div>
<span role="button" onClick={share}>Share</span>
```
