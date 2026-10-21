import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { loginDestination } from "@/features/auth/login-destination";
import { selectSessionStatus, useSession } from "@/lib/session/session-store";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Session gate for a route (COU-274 S1/S6). `expired` counts as no session, and the destination
 * travels whole in `?redirect=`; the session store hydrates synchronously, so the decision lands
 * on the first render and protected content never flashes. Authorization stays server-side.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const status = useSession(selectSessionStatus);
  const location = useLocation();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return <Navigate to={loginDestination(location)} replace />;
}
