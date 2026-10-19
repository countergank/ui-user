import type { TFunction } from "i18next";
import { type ReactNode, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { RouteAnnouncer } from "@/components/a11y/route-announcer";
import { CountergankLogo } from "@/components/branding/countergank-logo";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useFocusManagement } from "@/hooks/use-focus-management";

/**
 * Layout of the public site (COU-310, T1 / ADR-13).
 *
 * The informational pages share a layout, but not the console's: no product navigation,
 * no session-expiry bridge and no user menu. What it does keep is the accessibility floor
 * the templates guarantee — one skip link, one named navigation, one `main` landmark, an
 * announced route change and focus moved to the content on navigation.
 */

interface PublicNavItem {
  to: string;
  labelKey: "nav.home" | "nav.about";
}

const PUBLIC_NAV: PublicNavItem[] = [
  { to: "/", labelKey: "nav.home" },
  { to: "/about", labelKey: "nav.about" },
];

/** Route titles for the announcer; unknown paths fall back to the site title. */
const PAGE_TITLE_KEYS: Record<string, "title" | "about.title"> = {
  "/": "title",
  "/about": "about.title",
};

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
  }`;
}

function renderNav(items: PublicNavItem[], ariaLabel: string, t: TFunction<"landing">): ReactNode {
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

export function PublicLayout() {
  const location = useLocation();
  const { t } = useTranslation("landing");
  const { t: tCommon } = useTranslation();
  const { containerRef } = useFocusManagement(location.pathname);

  const title = t(PAGE_TITLE_KEYS[location.pathname] ?? "title");

  return (
    // One full-height flex column: `<main>` grows and the footer follows it, so a short
    // page (about) does not leave the footer glued to the last paragraph.
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        {tCommon("shell.skipLink")}
      </a>

      <RouteAnnouncer message={tCommon("shell.routeAnnouncer.loaded", { title })} />

      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          {/* The mark follows the foreground token, so it reads on both themes; the link
              carries the accessible name and the mark stays decorative. */}
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <CountergankLogo className="h-9 w-auto" />
            {t("title")}
          </Link>
          <div className="flex items-center gap-3">
            {renderNav(PUBLIC_NAV, t("nav.label"), t)}
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("nav.signIn")}
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        ref={containerRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 focus:outline-none"
      >
        <Suspense
          fallback={
            <p aria-busy="true" className="text-muted-foreground">
              {tCommon("shell.loading")}
            </p>
          }
        >
          <div key={location.pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>

      <footer className="mt-auto border-t bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <span>{t("title")}</span>
          <nav aria-label={tCommon("shell.navigation.footer")}>
            <ul className="flex items-center gap-4">
              <li>
                <a
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  href="https://github.com/countergank/ui-user"
                >
                  {t("footer.repository")}
                </a>
              </li>
              <li>
                <a
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  href="https://github.com/countergank/ui-user/tree/develop/docs"
                >
                  {t("footer.docs")}
                </a>
              </li>
              <li>
                <a
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  href="https://github.com/countergank/ui-user/blob/develop/LICENSE"
                >
                  {t("footer.license")}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
