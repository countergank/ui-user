import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loginDestination } from "@/features/auth/login-destination";
import { selectSessionStatus, useSession } from "@/lib/session/session-store";

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
