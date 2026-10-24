import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";

import { RouteAnnouncer } from "@/components/a11y/route-announcer";
import { AppLogo } from "@/components/branding/app-logo";
import { SessionExpiryBridge } from "@/components/session/session-expiry-bridge";
import { useFocusManagement } from "@/hooks/use-focus-management";
import { selectSidebarOpen, useUiStore } from "@/stores/use-ui-store";

import { ConsoleSidebar } from "./components/console-sidebar";
import { ConsoleTopbar } from "./components/console-topbar";
import { CONSOLE_NAV, type ConsoleNavItem, activeNavItem } from "./navigation";

export function DashboardLayout() {
  const location = useLocation();
  const { t: tCommon } = useTranslation();
  const { t: tConsole } = useTranslation("console");
  const { containerRef } = useFocusManagement(location.pathname);

  const sidebarOpen = useUiStore(selectSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const section: ConsoleNavItem | undefined = activeNavItem(CONSOLE_NAV, location.pathname);
  const sectionLabel = section ? tConsole(section.labelKey) : tConsole("nav.label");

  return (
    <>
      <a href="#main-content" className="skip-link">
        {tCommon("shell.skipLink")}
      </a>

      <RouteAnnouncer message={tCommon("shell.routeAnnouncer.loaded", { title: sectionLabel })} />

      <div className="flex min-h-screen bg-muted/30">
        <ConsoleSidebar
          open={sidebarOpen}
          drawerOpen={drawerOpen}
          onDrawerOpenChange={setDrawerOpen}
        />

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

          <SessionExpiryBridge />

          <main
            id="main-content"
            ref={containerRef}
            tabIndex={-1}
            className="w-full flex-1 px-4 py-8 focus:outline-none md:px-6"
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
            <div className="flex w-full items-center px-4 py-6 text-sm text-muted-foreground md:px-6">
              <Link
                to="/app"
                className="flex items-center gap-2 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppLogo className="h-5 w-5" />
                <span>{tConsole("shell.footerLabel")}</span>
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
