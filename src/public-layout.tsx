import type { TFunction } from "i18next";
import { type ReactNode, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { RouteAnnouncer } from "@/components/a11y/route-announcer";
import { AppLogo } from "@/components/branding/app-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useFocusManagement } from "@/hooks/use-focus-management";

interface PublicNavItem {
  to: string;
  labelKey: "nav.home" | "nav.about";
}

const SECTION_LINKS = [
  { href: "/#producto", labelKey: "nav.product" },
  { href: "/#capacidades", labelKey: "nav.capabilities" },
  { href: "/#seguridad", labelKey: "nav.security" },
] as const;

const PUBLIC_NAV: PublicNavItem[] = [
  { to: "/", labelKey: "nav.home" },
  { to: "/about", labelKey: "nav.about" },
];

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
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        {tCommon("shell.skipLink")}
      </a>

      <RouteAnnouncer message={tCommon("shell.routeAnnouncer.loaded", { title })} />

      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6 sm:px-8 lg:px-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
              <AppLogo className="h-9" />
              {t("title")}
            </Link>
            <nav aria-label={t("nav.sectionsLabel")} className="hidden items-center gap-6 md:flex">
              {SECTION_LINKS.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(section.labelKey)}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {renderNav(PUBLIC_NAV, t("nav.label"), t)}
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("nav.signIn")}
            </Link>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        ref={containerRef}
        tabIndex={-1}
        className="flex-1 w-full focus:outline-none"
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
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground sm:px-8 lg:px-16">
          <div className="flex items-center gap-2.5">
            <AppLogo className="h-7" />
            <span>{t("footer.copyright", { year: 2026 })}</span>
          </div>
          <nav aria-label={tCommon("shell.navigation.footer")}>
            <ul className="flex items-center gap-4">
              <li>
                <Link
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  to="/about"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <a
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  href="/#capacidades"
                >
                  {t("nav.capabilities")}
                </a>
              </li>
              <li>
                <a
                  className="underline-offset-4 hover:text-foreground hover:underline"
                  href="https://github.com/countergank/ui-user"
                >
                  {t("footer.github")}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
