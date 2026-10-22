import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loginDestination } from "@/features/auth/login-destination";
import { selectSessionStatus, useSession } from "@/lib/session/session-store";

/**
 * AC2 (COU-273): a failed refresh marks the session `expired` and this bridge navigates. Since
 * COU-323 the redirect carries the current route, which an expired session used to drop.
 */
export function SessionExpiryBridge(): null {
  const status = useSession(selectSessionStatus);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status === "expired") {
      void navigate(loginDestination(location), { replace: true });
    }
  }, [status, navigate, location]);

  return null;
}
