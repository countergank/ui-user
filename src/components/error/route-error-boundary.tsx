import { useTranslation } from "react-i18next";
import { Navigate, isRouteErrorResponse, useRouteError } from "react-router-dom";

import { isForbiddenError } from "@/features/authorization/forbidden";
import { DataFetchError, toError } from "@/lib/errors";
import { ErrorView } from "./error-view";

/**
 * Route-level error boundary (ARCH-4, react-router errorElement/ErrorBoundary).
 *
 * Rendered by the data router inside `errorElement` when a loader, action, or
 * render throws. Uses `useRouteError()` (react-router v7 pattern) and renders
 * the accessible <ErrorView>. Errors are normalized to `Error` instances so we
 * never render raw thrown values. All boundary copy is resource-driven
 * (COU-253); statusText and thrown messages remain dynamic content.
 *
 * A 403 the action did not expect is not a failure to retry or to report as "something went
 * wrong" (COU-275, S6), and since COU-274 it is not rendered in place either: the boundary
 * navigates to `/forbidden`, so the URL matches what the person is reading and a reload keeps
 * the same answer.
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
