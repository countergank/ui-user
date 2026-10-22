import { useTranslation } from "react-i18next";
import { Navigate, isRouteErrorResponse, useRouteError } from "react-router-dom";

import { isForbiddenError } from "@/features/authorization/forbidden";
import { DataFetchError, toError } from "@/lib/errors";
import { ErrorView } from "./error-view";

/**
 * Route-level error boundary (ARCH-4, COU-253), rendered by the data router when a loader,
 * action, or render throws; all copy is resource-driven. A 403 is not rendered in place:
 * it navigates to `/forbidden` so the URL matches and a reload keeps the same answer (S6).
 */
export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();

  if (isForbiddenError(error)) {
    return <Navigate to="/forbidden" replace />;
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
