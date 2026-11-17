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

export function resetPassword(token: string, newPassword: string): Promise<unknown> {
  return httpClient.request<unknown>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}

/**
 * @param token - the confirmation token from the email link; applies the pending email
 * change, invalidates every session of the account and opens the 72 h revert window.
 * @returns Nothing meaningful; the change is complete when this resolves with 200.
 */
export function confirmEmailChange(token: string): Promise<unknown> {
  return httpClient.request<unknown>("/auth/confirm-email-change", {
    method: "POST",
    body: { token },
  });
}

/**
 * @param token - the revert token from the notice that reaches the previous inbox;
 * rolls the email change back inside the 72 h revert window.
 * @returns Nothing meaningful; the change is reverted when this resolves with 200.
 */
export function revertEmailChange(token: string): Promise<unknown> {
  return httpClient.request<unknown>("/auth/revert-email-change", {
    method: "POST",
    body: { token },
  });
}
