import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { ErrorView } from "@/components/error/error-view";

import { usePermissions } from "../hooks/use-permissions";
import { hasPermission } from "../permissions";

interface RequirePermissionProps {
  /** The permission the route needs, from the same vocabulary the actions use. */
  permission: string;
  children: ReactNode;
}

/**
 * Permission gate for a route (COU-274 S2/S9, COU-323). Loading renders a busy indicator and
 * nothing else; a failed profile read is a retryable error (it proves nothing about the grant);
 * a missing grant is `/forbidden`; the server stays the authority (ADR-13).
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { t } = useTranslation();
  const { permissions, isLoading, isError, refetch } = usePermissions();

  if (isLoading) {
    return (
      // Deliberate live region, same pattern as the route announcer: `<output>` carries the
      // "result of a calculation" semantics, not a loading state.
      // biome-ignore lint/a11y/useSemanticElements: intentional status live region, not an <output>
      <p role="status" aria-busy="true" className="text-muted-foreground">
        {t("shell.loading")}
      </p>
    );
  }

  if (isError) {
    return (
      <ErrorView
        title={t("error.dataFetchTitle")}
        message={t("error.genericMessage")}
        onRetry={refetch}
      />
    );
  }

  if (!hasPermission(permissions, permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
