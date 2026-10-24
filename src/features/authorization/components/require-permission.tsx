import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { ErrorView } from "@/components/error/error-view";

import { usePermissions } from "../hooks/use-permissions";
import { hasPermission } from "../permissions";

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { t } = useTranslation();
  const { permissions, isLoading, isError, refetch } = usePermissions();

  if (isLoading) {
    return (
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
