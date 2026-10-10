---
priority: P2
category: vite
---

# Handle Static Assets Correctly

**Do**: Import static assets (images, fonts, SVGs) directly so Vite processes them through the asset pipeline. Use the `public/` directory only for assets that must keep their exact filename and path.

**Avoid**: Using relative paths to `src/` assets in HTML. Putting every asset in `public/` (bypasses hashing and optimization).

**Example**:
```tsx
// Correct: imported asset — gets hashed and optimized
import logo from "./assets/logo.svg";
function Header() {
  return <img src={logo} alt="Company logo" />;
}

// Correct: SVG as React component (with vite-plugin-svgr)
import { ReactComponent as Logo } from "./assets/logo.svg";
function Header() {
  return <Logo aria-label="Company logo" />;
}

// Correct: public/ for assets that need stable URLs
// /favicon.ico served from public/ without hashing
<link rel="icon" href="/favicon.ico" />

// Wrong: relative path to src asset — breaks in production
<img src="./assets/logo.svg" alt="logo" />
```
