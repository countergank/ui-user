import { useTranslation } from "react-i18next";
import { Navigate, isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";

import { loginDestination } from "@/features/auth/login-destination";
import { isForbiddenError } from "@/features/authorization/forbidden";
import { DataFetchError, toError } from "@/lib/errors";
import { selectSessionStatus, useSession } from "@/lib/session/session-store";
import { ErrorView } from "./error-view";

/**
 * Route-level error boundary (ARCH-4). A 403 is never retried or reported as "something went
 * wrong": it navigates to `/forbidden`, or to login with the current route when no session is
 * loaded — `/forbidden` itself sits behind `RequireAuth` (COU-323).
 */
export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();
  const location = useLocation();
  const status = useSession(selectSessionStatus);

  if (isForbiddenError(error)) {
    return status === "authenticated" ? (
      <Navigate to="/forbidden" replace />
    ) : (
      <Navigate to={loginDestination(location)} replace />
    );
  }

  let title: string = t("error.genericTitle");
  let message: string = t("error.genericMessage");

  if (isRouteErrorResponse(error)) {
    title = t("error.statusTitle", { status: String(error.status) });
    message =
      typeof error.statusText === "string" && error.statusText.length > 0
        ? error.statusText
        : t("error.routeFallbackMessage");
  } else {
    const normalized = toError(error);
    message = normalized.message || message;
    if (error instanceof DataFetchError) {
      title = t("error.dataFetchTitle");
    }
  }

  // The data router remounts the boundary on navigation; a full-page reload is
  // the simplest reliable retry for a route-level crash.
  return (
    <ErrorView
      title={title}
      message={message}
      onRetry={() => {
        window.location.reload();
      }}
    />
  );
}
