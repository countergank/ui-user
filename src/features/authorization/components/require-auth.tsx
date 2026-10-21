import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { selectSessionStatus, useSession } from "@/lib/session/session-store";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Session gate for a route (COU-274, T1 / S1, S6).
 *
 * The console is gated for UX and deep-link preservation, never as the authorization
 * decision: `api-user` still authorizes every request (ADR-13, ASVS V8.3.1). What this adds
 * is that an anonymous visitor never sees the console, and that the destination survives the
 * trip — the full path, query and hash, encoded into `?redirect=`, which the login screen
 * already validates with an allowlist (`safe-redirect.ts`) before following it.
 *
 * `expired` is treated as "not authenticated": the tokens are gone, so rendering the console
 * would show a shell that cannot load anything. The session store hydrates synchronously
 * from storage, so the decision is made on the first render — there is no frame in which
 * protected content appears and then disappears.
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
