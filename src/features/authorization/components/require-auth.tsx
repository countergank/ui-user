import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { loginDestination } from "@/features/auth/login-destination";
import { selectSessionStatus, useSession } from "@/lib/session/session-store";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const status = useSession(selectSessionStatus);
  const location = useLocation();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return <Navigate to={loginDestination(location)} replace />;
}
