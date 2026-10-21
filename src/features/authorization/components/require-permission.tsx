import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { usePermissions } from "../hooks/use-permissions";
import { hasPermission } from "../permissions";

interface RequirePermissionProps {
  /** The permission the route needs, from the same vocabulary the actions use. */
  permission: string;
  children: ReactNode;
}

/**
 * Permission gate for a route (COU-274, T2 / S2, S9).
 *
 * Predicts the server's answer so a user is not walked into a section they cannot read, and
 * sends them to `/forbidden` — a real page, not the router's 404 — so the message explains
 * the denial instead of pretending the route does not exist.
 *
 * While the profile is in flight it renders a busy indicator and **nothing else**: showing
 * the section first and then removing it is the flash the ticket rules out, and treating
 * "loading" as "denied" would bounce an authorized user to `/forbidden` on every reload.
 *
 * A failed profile read yields no permissions (`usePermissions` fails closed), which lands on
 * `/forbidden` — the honest answer, since the client cannot prove the grant.
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { t } = useTranslation();
  const { permissions, isLoading } = usePermissions();

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

  if (!hasPermission(permissions, permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
