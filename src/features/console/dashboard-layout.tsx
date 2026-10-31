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

export function DashboardLayout() {
  const location = useLocation();
  const { t: tCommon } = useTranslation();
  const { t: tConsole } = useTranslation("console");
  const { containerRef } = useFocusManagement(location.pathname);

  const sidebarOpen = useUiStore(selectSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { t: tUsers } = useTranslation("users");
  const section: ConsoleNavItem | undefined = activeNavItem(CONSOLE_NAV, location.pathname);
  const sectionLabel = section ? tConsole(section.labelKey) : tConsole("nav.label");

  const usersMatch = /\/app\/users\/([^/]+)(\/edit)?$/.exec(location.pathname);
  const pageTrail: { label: string; to?: string }[] = [];
  if (location.pathname === "/app/users/new") {
    pageTrail.push({ label: tUsers("create.title") });
  } else if (usersMatch) {
    pageTrail.push({ label: tUsers("detail.title") });
    if (usersMatch[2]) {
      pageTrail[0] = { label: tUsers("edit.title") };
    }
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {tCommon("shell.skipLink")}
      </a>

      <RouteAnnouncer message={tCommon("shell.routeAnnouncer.loaded", { title: sectionLabel })} />

      <div className="fixed inset-0 flex overflow-hidden bg-canvas">
        <ConsoleSidebar
          open={sidebarOpen}
          drawerOpen={drawerOpen}
          onDrawerOpenChange={setDrawerOpen}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ConsoleTopbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onOpenDrawer={() => {
              setDrawerOpen(true);
            }}
            sectionLabel={sectionLabel}
            atRoot={location.pathname === "/app"}
            pageTrail={pageTrail}
          />

          <SessionExpiryBridge />

          <main
            id="main-content"
            ref={containerRef}
            tabIndex={-1}
            className="min-h-0 w-full flex-1 overflow-y-auto px-4 py-8 focus:outline-none md:px-6"
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
        </div>
      </div>
    </>
  );
}
