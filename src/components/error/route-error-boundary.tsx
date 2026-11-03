import { useTranslation } from "react-i18next";
import { Navigate, isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";

import { loginDestination } from "@/features/auth/login-destination";
import { isForbiddenError } from "@/features/authorization/forbidden";
import { DataFetchError } from "@/lib/errors";
import { resolveApiErrorPresentation } from "@/lib/errors/resolve";
import { selectSessionStatus, useSession } from "@/lib/session/session-store";
import { ErrorView } from "./error-view";

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
  let traceId: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = t("error.statusTitle", { status: String(error.status) });
    message =
      typeof error.statusText === "string" && error.statusText.length > 0
        ? error.statusText
        : t("error.routeFallbackMessage");
  } else {
    const presentation = resolveApiErrorPresentation(error);
    message = t(presentation.messageKey);
    traceId = presentation.traceId ?? undefined;
    if (error instanceof DataFetchError) {
      title = t("error.dataFetchTitle");
    }
  }

  return (
    <ErrorView
      title={title}
      message={message}
      traceId={traceId}
      onRetry={() => {
        window.location.reload();
      }}
    />
  );
}
