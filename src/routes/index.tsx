import { createBrowserRouter } from "react-router-dom";

import { RouteErrorBoundary } from "@/components/error/route-error-boundary";
import { RequireAuth } from "@/features/authorization/components/require-auth";
import { ConsolePlaceholder } from "@/features/console/console-placeholder";
import { DashboardLayout } from "@/features/console/dashboard-layout";
import { ForbiddenPage } from "@/features/console/forbidden-page";
import { RequireSection } from "@/features/console/require-section";
import { PublicLayout } from "@/public-layout";

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
    path: "/login",
    lazy: () => import("./login-route"),
    errorElement: <RouteErrorBoundary />,
  },
  {
    ...consoleRoute,
    path: "/app",
    children: [
      { index: true, Component: ConsolePlaceholder },
      { path: "users", lazy: () => import("./users-route") },
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
    path: "/profile",
    children: [{ index: true, Component: ConsolePlaceholder }],
    element: consoleRoute.element,
    errorElement: <RouteErrorBoundary />,
  },
]);
