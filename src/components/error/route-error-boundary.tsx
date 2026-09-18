import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { DataFetchError, toError } from "@/lib/errors";
import { ErrorView } from "./error-view";

/**
 * Route-level error boundary (ARCH-4, react-router errorElement/ErrorBoundary).
 *
 * Rendered by the data router inside `errorElement` when a loader, action, or
 * render throws. Uses `useRouteError()` (react-router v7 pattern) and renders
 * the accessible <ErrorView>. Errors are normalized to `Error` instances so we
 * never render raw thrown values.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `Error ${String(error.status)}`;
    message =
      typeof error.statusText === "string" && error.statusText.length > 0
        ? error.statusText
        : "The requested page could not be loaded.";
  } else {
    const normalized = toError(error);
    message = normalized.message || message;
    if (error instanceof DataFetchError) {
      title = "Could not load data";
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
