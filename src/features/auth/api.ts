import { AppError } from "@/lib/errors";
import { httpClient } from "@/lib/session/session";
import type { AuthResponse } from "@/lib/session/session-manager";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorChallenge {
  twoFactorRequired: true;
  challengeToken: string;
}

export type LoginResponse = AuthResponse | TwoFactorChallenge;

const TWO_FACTOR_CODE_PATTERN = /^\d{6}$/;

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return httpClient.request<LoginResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function isTwoFactorChallenge(response: LoginResponse): response is TwoFactorChallenge {
  const candidate = response as Partial<TwoFactorChallenge>;
  return candidate.twoFactorRequired === true;
}

/**
 * @param challengeToken - the short-lived token POST /auth/login returned for a pending
 * second-factor challenge; expired, unknown or budget-exhausted tokens fail with
 * `UA-AUTH-014` server-side and the user must re-authenticate with password.
 * @param code - the 6-digit TOTP code the user's authenticator app currently shows;
 * anything else is rejected as `UA-AUTH-013` before any network traffic.
 * @returns The full `AuthResponse` that completes the session, identical to a direct login.
 */
export function verifyTwoFactorChallenge(
  challengeToken: string,
  code: string,
): Promise<AuthResponse> {
  if (!TWO_FACTOR_CODE_PATTERN.test(code)) {
    throw new AppError("The two-factor challenge code must be exactly 6 digits.", {
      code: "UA-AUTH-013",
      status: 401,
    });
  }

  return httpClient.request<AuthResponse>("/auth/2fa/challenge", {
    method: "POST",
    body: { challengeToken, code },
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
