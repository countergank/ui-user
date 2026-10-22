import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { selectSessionStatus, useSession } from "@/lib/session/session-store";

/**
 * AC2 (COU-273): when a refresh fails the session becomes `expired` and the user must land
 * on the login page; this bridge reacts to the state the session layer already exposes.
 * It renders nothing; before COU-281 ships, `/login` resolves to the router's not-found.
 */
export function SessionExpiryBridge(): null {
  const status = useSession(selectSessionStatus);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "expired") {
      void navigate("/login", { replace: true });
    }
  }, [status, navigate]);

  return null;
}
