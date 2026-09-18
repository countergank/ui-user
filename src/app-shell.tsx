import { type ReactNode, Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { RouteAnnouncer } from "@/components/a11y/route-announcer";
import { useFocusManagement } from "@/hooks/use-focus-management";

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/about": "About",
};

/** Compute a human-readable title for the route announcer. */
function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "Page";
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
  }`;
}

function renderNav(items: NavItem[], ariaLabel: string): ReactNode {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end className={navLinkClass}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Application shell (ADR-6 / ARCH-6): consistent landmarks, skip link, route
 * announcer, focus management, and a Suspense boundary around routed content.
 * Rendered as the root layout route in the data router.
 */
export function AppShell() {
  const location = useLocation();
  const { containerRef } = useFocusManagement(location.pathname);
  const title = getPageTitle(location.pathname);
  const routeKey = location.pathname;

  return (
    <>
      {/* First focusable element: skip link (a11y skip-links rule) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <RouteAnnouncer message={`${title} page loaded`} />

      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <span className="text-sm font-semibold">Standard Frontend</span>
          {renderNav(NAV_ITEMS, "Main navigation")}
        </div>
      </header>

      <main
        id="main-content"
        ref={containerRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 focus:outline-none"
      >
        <Suspense
          fallback={
            <p aria-busy="true" className="text-muted-foreground">
              Loading page…
            </p>
          }
        >
          {/* Keyed by pathname so each route is its own suspense boundary */}
          <div key={routeKey}>
            <Outlet />
          </div>
        </Suspense>
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <span>Frontend Standard Template</span>
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-4">
              <li>
                <a className="hover:text-foreground underline-offset-4 hover:underline" href="/">
                  Home
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground underline-offset-4 hover:underline"
                  href="/about"
                >
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
