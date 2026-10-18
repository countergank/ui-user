import { httpClient } from "@/lib/session/session";
import type { AuthResponse } from "@/lib/session/session-manager";

/**
 * Login transport (COU-281, T4).
 *
 * `POST /auth/login` per the api-user contract (S14). The session is not started here:
 * that is the mutation's success handler, so this stays a plain request that a test can
 * call without a store.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return httpClient.request<AuthResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}
