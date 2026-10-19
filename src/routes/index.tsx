import { createBrowserRouter } from "react-router-dom";

import { RouteErrorBoundary } from "@/components/error/route-error-boundary";
import { PublicLayout } from "@/public-layout";

/**
 * App router (ADR-4 / STACK-7).
 * `createBrowserRouter` data router; per-route lazy modules via the router's
 * `lazy` (dynamic import) for code splitting (ARCH-5, bundle-001) and a
 * route-level errorElement wired to <RouteErrorBoundary> (ARCH-4).
 */
export const router = createBrowserRouter([
  {
    // ADR-13: `/` and `/about` are the public site, with their own layout. The console
    // shell (`AppShell`) moves under `/app/*` in COU-278, which is why it has no route
    // here for now.
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
]);
