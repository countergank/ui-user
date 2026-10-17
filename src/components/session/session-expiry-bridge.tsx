import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { selectSessionStatus, useSession } from "@/lib/session/session-store";

/**
 * AC2 (COU-273): when a refresh fails, the session becomes `expired` and the user must
 * land on the login page. Route guards (U05) and the login screen itself (U12/COU-281)
 * are explicitly out of scope, so this bridge does the one thing the ticket asks for:
 * react to the state the session layer already exposes, and navigate.
 *
 * It renders nothing. Before COU-281 ships, `/login` resolves to the router's
 * not-found route — the destination exists, the page does not yet.
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
