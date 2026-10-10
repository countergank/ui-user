import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/app-shell";
import { RouteErrorBoundary } from "@/components/error/route-error-boundary";

/**
 * App router (ADR-4 / STACK-7).
 * `createBrowserRouter` data router; per-route lazy modules via the router's
 * `lazy` (dynamic import) for code splitting (ARCH-5, bundle-001) and a
 * route-level errorElement wired to <RouteErrorBoundary> (ARCH-4).
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, lazy: () => import("./home-route") },
      { path: "about", lazy: () => import("./about-route") },
    ],
  },
]);
