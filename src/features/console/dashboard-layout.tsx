import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import { RouteAnnouncer } from "@/components/a11y/route-announcer";
import { SessionExpiryBridge } from "@/components/session/session-expiry-bridge";
import { useFocusManagement } from "@/hooks/use-focus-management";
import { selectSidebarOpen, useUiStore } from "@/stores/use-ui-store";

import { ConsoleSidebar } from "./components/console-sidebar";
import { ConsoleTopbar } from "./components/console-topbar";
import { CONSOLE_NAV, type ConsoleNavItem, activeNavItem } from "./navigation";

/**
 * The console shell (COU-278, T1-T6 / S1-S14): the console's only layout (ADR-13), so
 * `/app/*` and `/profile` render inside it and public pages cannot inherit its chrome.
 * It keeps the template's accessibility floor (S4) unchanged.
 */
export function DashboardLayout() {
  const location = useLocation();
  const { t: tCommon } = useTranslation();
  const { t: tConsole } = useTranslation("console");
  const { containerRef } = useFocusManagement(location.pathname);

  const sidebarOpen = useUiStore(selectSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  // Drawer state is local on purpose: unlike the desktop expansion it is not a preference
  // worth remembering, and persisting it would reopen a drawer on the next page load.
  const [drawerOpen, setDrawerOpen] = useState(false);

  const section: ConsoleNavItem | undefined = activeNavItem(CONSOLE_NAV, location.pathname);
  const sectionLabel = section ? tConsole(section.labelKey) : tConsole("nav.label");

  return (
    <>
      {/* First focusable element: skip link (a11y skip-links rule) */}
      <a href="#main-content" className="skip-link">
        {tCommon("shell.skipLink")}
      </a>

      <RouteAnnouncer message={tCommon("shell.routeAnnouncer.loaded", { title: sectionLabel })} />

      <div className="flex min-h-screen bg-muted/30">
        <div id="console-sidebar">
          <ConsoleSidebar
            open={sidebarOpen}
            drawerOpen={drawerOpen}
            onDrawerOpenChange={setDrawerOpen}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <ConsoleTopbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onOpenDrawer={() => {
              setDrawerOpen(true);
            }}
            sectionLabel={sectionLabel}
            atRoot={location.pathname === "/app"}
          />

          {/* Says nothing visually: the expired-session redirect has to live inside the
              console so it fires on any console page, exactly as COU-273 designed it. */}
          <SessionExpiryBridge />

          <main
            id="main-content"
            ref={containerRef}
            tabIndex={-1}
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 focus:outline-none"
          >
            <Suspense
              fallback={
                <p aria-busy="true" className="text-muted-foreground">
                  {tCommon("shell.loading")}
                </p>
              }
            >
              {/* Keyed by pathname so each route is its own Suspense boundary */}
              <div key={location.pathname}>
                <Outlet />
              </div>
            </Suspense>
          </main>

          <footer className="mt-auto border-t bg-background">
            <div className="mx-auto flex max-w-7xl items-center px-4 py-6 text-sm text-muted-foreground">
              <span>{tConsole("shell.footerLabel")}</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
