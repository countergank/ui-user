import { httpClient } from "@/lib/session/session";
import type { AuthResponse } from "@/lib/session/session-manager";

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

export function requestPasswordReset(email: string): Promise<unknown> {
  return httpClient.request<unknown>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}
