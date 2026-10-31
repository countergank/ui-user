---
name: react-frontend
description: "Trigger: react, reactjs, frontend, spa, component, hook, vite, vitest, jsx, tsx, css, responsive, a11y, accessibility, accesibilidad, wcag, dark mode, bundle, performance, rendimiento. Use this skill whenever an agent builds or modifies a React 19 SPA with TypeScript 5, Vite, and Vitest — components, hooks, forms, tests, styling, routing, or bundles. Load it before writing any React or frontend code and read the domain files that match the task; skipping it misses the project's WCAG 2.2 and performance rules. Úsala siempre que se construya o modifique un SPA de React 19 con TypeScript, Vite y Vitest — componentes, hooks, formularios, tests, estilos o bundles; léela antes de escribir cualquier código de frontend y abre los archivos de dominio que apliquen."
license: MIT
permissions:
  - read-files
  - write-files
metadata:
  author: countergank
  version: "2.0.0"
---

Modern React 19 SPA standard: TypeScript 5, Vite, Vitest, WCAG 2.2. Ten domain files; each rule states one decision with one ✅/❌ pair. Read the domains that match the task — the priority heading inside each file says how blocking its rules are.

| File | Read it when | Why |
|------|--------------|-----|
| `rules/react.md` | Writing or editing components and hooks | Keys, refs by React version, effects, memoization, transitions |
| `rules/typescript.md` | Configuring the compiler or handling unknown data | Strict-mode compiler baseline |
| `rules/vite.md` | Touching `vite.config.ts` or importing assets | Build chunks and asset imports |
| `rules/vitest.md` | Writing tests or setting CI coverage | Mock strategy and coverage gates |
| `rules/css-responsive.md` | Styling components or responsive layout | Logical properties, mobile-first, container queries, breakpoints |
| `rules/performance.md` | Optimizing rendering, fetching, or caching | Barrel-free imports, parallel fetching, Suspense, data-layer cache |
| `rules/bundle-loading.md` | Splitting routes or loading images and fonts | Dynamic imports, image dimensions, preload/prefetch/preconnect |
| `rules/ux-design-tokens.md` | Building async views or theming | Loading/empty/error coverage and dark mode |
| `rules/accessibility-structure.md` | Writing markup, forms, or focusable UI | Semantic HTML, focus indicators, target size, skip links |
| `rules/accessibility-feedback.md` | Using color, motion, or async feedback | Contrast, reduced motion, route announcer, live regions, form errors |

Accessibility linting (`jsx-a11y` strict) runs in `assets/eslint.config.js`; a11y rules not carried there live in the two accessibility files. Templates: `assets/vite.config.ts`, `assets/vitest.config.ts`, `assets/RouteAnnouncer.tsx`.
