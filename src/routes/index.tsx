import { createBrowserRouter } from "react-router-dom";

import { RouteErrorBoundary } from "@/components/error/route-error-boundary";
import { RequireAuth } from "@/features/authorization/components/require-auth";
import { ConsolePlaceholder } from "@/features/console/console-placeholder";
import { DashboardLayout } from "@/features/console/dashboard-layout";
import { ForbiddenPage } from "@/features/console/forbidden-page";
import { RequireSection } from "@/features/console/require-section";
import { PublicLayout } from "@/public-layout";

/**
 * App router (ADR-4 / STACK-7, ADR-13, COU-274).
 * `createBrowserRouter` data router; per-route lazy modules via the router's
 * `lazy` (dynamic import) for code splitting (ARCH-5, bundle-001) and a
 * route-level errorElement wired to <RouteErrorBoundary> (ARCH-4).
 *
 * ADR-13 fixes the shape: two surfaces, split at route level.
 * - `/`, `/about` and `/login` are public and carry their own chrome.
 * - `/app/*`, `/forbidden` and `/profile` are the console: one shell (`DashboardLayout`),
 *   behind `RequireAuth`, with each section asking `RequireSection` for the permission the
 *   manifest already declares. The shell is imported eagerly because it wraps every console
 *   page.
 *
 * Sections under the console land on `ConsolePlaceholder` until their own ticket adds the
 * page (COU-289 onwards), so a manifest entry never resolves to a 404 inside the shell.
 */
const consoleRoute = {
  element: (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  ),
  errorElement: <RouteErrorBoundary />,
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, lazy: () => import("./landing-route") },
      { path: "about", lazy: () => import("./about-route") },
    ],
  },
  {
    // Sibling of the shell on purpose: a login gate needs no product navigation.
    path: "/login",
    lazy: () => import("./login-route"),
    errorElement: <RouteErrorBoundary />,
  },
  {
    ...consoleRoute,
    path: "/app",
    children: [
      { index: true, Component: ConsolePlaceholder },
      {
        path: "*",
        element: (
          <RequireSection>
            <ConsolePlaceholder />
          </RequireSection>
        ),
      },
    ],
  },
  {
    ...consoleRoute,
    path: "/forbidden",
    children: [{ index: true, Component: ForbiddenPage }],
  },
  {
    // COU-285 and COU-288 build the profile inside this shell; the route exists now so the
    // user menu's destination is inside the authenticated area, not on the public site.
    path: "/profile",
    children: [{ index: true, Component: ConsolePlaceholder }],
    element: consoleRoute.element,
    errorElement: <RouteErrorBoundary />,
  },
]);
