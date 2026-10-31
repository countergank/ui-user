# Bundle Loading — Priority P0

Code splitting and resource loading rules, ordered by priority.

## P0 — Split code with dynamic imports

Load route-level and feature-level code on demand with `import()`, pair `React.lazy` with a `<Suspense>` fallback that matches the layout, and preload the routes users are likely to navigate to next.

```tsx
// ✅ Routes load on demand behind a Suspense fallback
import { lazy, Suspense } from "react";

const SettingsPage = lazy(() => import("./pages/Settings"));

function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Route path="/settings" element={<SettingsPage />} />
    </Suspense>
  );
}
```

```tsx
// ❌ Every page ships in the initial bundle
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
```

Reserve separate chunks for code that earns one: routes and heavy features. Lazy-loading tiny components used on every page load adds a request without saving bytes.

## P1 — Optimize images with dimensions and lazy loading

Specify `width` and `height` on every image so the browser reserves space before the file loads, use `loading="lazy"` for below-the-fold images, and `decoding="async"` to keep decode work off the main thread.

```tsx
// ✅ Dimensions reserve space; eager load protects LCP
<img
  src="/hero.jpg"
  width="1200"
  height="600"
  alt="Product showcase"
  loading="eager"
  decoding="async"
/>
```

```tsx
// ❌ No dimensions — layout shifts when the image arrives
<img src="/photo.jpg" alt="A photo" />
```

Keep above-the-fold images eager: lazy-loading the LCP image delays the largest paint.

## P1 — Preload critical resources, prefetch likely-next ones

Use `<link rel="preload">` for critical same-page resources (fonts, hero images, critical CSS), and `<link rel="prefetch">` or a hover/focus-triggered dynamic `import()` for resources the user is likely to need next. Add `<link rel="preconnect">` for origins the app definitely requests from, and `<link rel="dns-prefetch">` for third-party origins it may request later.

```tsx
// ✅ Preload now; prefetch the likely next page on hover
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
<link rel="preconnect" href="https://api.example.com" crossorigin />
<link rel="dns-prefetch" href="https://analytics.example.com" />

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleMouseEnter = () => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  };
  return <a href={href} onMouseEnter={handleMouseEnter}>{children}</a>;
}
```

```tsx
// ❌ Preload for navigation preloads resources the user may never use
<link rel="preload" href="/settings-page.js" as="script" />
```

Limit `preconnect` to the origins that matter — the browser caps connections at roughly six per origin, so every wasted preconnect displaces a useful one.
