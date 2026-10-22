import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { selectSessionStatus, useSession } from "@/lib/session/session-store";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Session gate for a route (COU-274, T1 / S1, S6): deep-link preservation, never the
 * authorization decision (ADR-13). The full destination survives in `?redirect=` for
 * `safe-redirect.ts`; `expired` counts as not authenticated — its tokens are gone.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const status = useSession(selectSessionStatus);
  const location = useLocation();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  const destination = `${location.pathname}${location.search}${location.hash}`;

  return <Navigate to={`/login?redirect=${encodeURIComponent(destination)}`} replace />;
}
