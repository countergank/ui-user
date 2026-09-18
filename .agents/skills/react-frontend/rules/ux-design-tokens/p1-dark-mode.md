---
priority: P1
category: ux-design-tokens
---

# Support Dark Mode with System Preference Detection

**Do**: Use the `color-scheme` meta tag and CSS `prefers-color-scheme` media query to respect the user's OS-level preference. Implement a toggle that stores the choice in `localStorage` and falls back to system preference.

**Avoid**: Hardcoding a single theme. Using JavaScript to detect preference before CSS renders (causes flash). Forgetting `color-scheme` meta tag (affects form controls and scrollbars).

**Example**:
```html
<!-- Correct: meta tag for browser UI -->
<meta name="color-scheme" content="light dark" />
```

```css
/* Correct: CSS respects system preference */
:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --text: #111827;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111827;
    --text: #f9fafb;
  }
}

/* Correct: JS toggle with system fallback */
function getPreferredTheme(): "light" | "dark" {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
```
