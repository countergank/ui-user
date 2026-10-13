import type { TFunction } from "i18next";
import { type ReactNode, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { RouteAnnouncer } from "@/components/a11y/route-announcer";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useFocusManagement } from "@/hooks/use-focus-management";

interface NavItem {
  to: string;
  labelKey: "shell.nav.home" | "shell.nav.about";
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "shell.nav.home" },
  { to: "/about", labelKey: "shell.nav.about" },
];

const PAGE_TITLE_KEYS: Record<string, "routes.home.title" | "routes.about.title"> = {
  "/": "routes.home.title",
  "/about": "routes.about.title",
};

/** Compute a localized title for the route announcer. */
function getPageTitle(pathname: string, t: TFunction): string {
  return t(PAGE_TITLE_KEYS[pathname] ?? "routes.fallback.title");
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
  }`;
}

function renderNav(items: NavItem[], ariaLabel: string, t: TFunction): ReactNode {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end className={navLinkClass}>
              {t(item.labelKey)}
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
  const { t } = useTranslation();
  const { containerRef } = useFocusManagement(location.pathname);
  const title = getPageTitle(location.pathname, t);
  const routeKey = location.pathname;

  return (
    <>
      {/* First focusable element: skip link (a11y skip-links rule) */}
      <a href="#main-content" className="skip-link">
        {t("shell.skipLink")}
      </a>

      <RouteAnnouncer message={t("shell.routeAnnouncer.loaded", { title })} />

      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <span className="text-sm font-semibold">{t("shell.productLabel")}</span>
          <div className="flex items-center gap-3">
            {renderNav(NAV_ITEMS, t("shell.navigation.main"), t)}
            {/* Theme control lives in the shell header, in plain sight: switching
                the theme is a frequent action, not a buried user-menu preference. */}
            <ThemeSwitcher />
          </div>
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
              {t("shell.loading")}
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
          <span>{t("shell.footerLabel")}</span>
          <nav aria-label={t("shell.navigation.footer")}>
            <ul className="flex items-center gap-4">
              <li>
                <a className="hover:text-foreground underline-offset-4 hover:underline" href="/">
                  {t("shell.nav.home")}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground underline-offset-4 hover:underline"
                  href="/about"
                >
                  {t("shell.nav.about")}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
