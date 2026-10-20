import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { ForbiddenView } from "@/features/authorization/components/forbidden-view";
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
 * A 403 is answered by `ForbiddenView` instead (COU-275, S6): the server denied the
 * action, which is not a failure to retry or to report as "something went wrong".
 */
export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();

  if (isForbiddenError(error)) {
    return <ForbiddenView />;
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
