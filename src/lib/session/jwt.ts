export interface AccessTokenClaims {
  sub?: string;
  exp?: number;
  iat?: number;
  email?: string;
  role?: string;
}

export interface DecodedAccessToken {
  sub: string | null;
  expiresAt: number | null;
}

export const DEFAULT_EXPIRY_SKEW_MS = 15_000;

function base64UrlToBase64(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  return normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
}

/**
 * @param token - a JWT-shaped access token, with or without a usable payload.
 * @returns The decoded claims, or `null` when the token is not a readable JWT.
 */
export function decodeAccessToken(token: string): DecodedAccessToken | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(atob(base64UrlToBase64(parts[1])));
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const claims = parsed as AccessTokenClaims;

    return {
      sub: typeof claims.sub === "string" ? claims.sub : null,
      expiresAt: typeof claims.exp === "number" ? claims.exp * 1000 : null,
    };
  } catch {
    return null;
  }
}

/**
 * @returns Milliseconds left before expiry, clamped at zero; unreadable tokens count as expired.
 */
export function millisecondsUntilExpiry(token: string, now: number = Date.now()): number {
  const decoded = decodeAccessToken(token);
  if (decoded?.expiresAt == null) {
    return 0;
  }

  return Math.max(0, decoded.expiresAt - now);
}

/**
 * @returns Whether the token is inside the refresh margin; an unreadable token is reported
 * expired, failing closed.
 */
export function isTokenExpired(
  token: string,
  now: number = Date.now(),
  skewMs: number = DEFAULT_EXPIRY_SKEW_MS,
): boolean {
  const decoded = decodeAccessToken(token);
  if (decoded?.expiresAt == null) {
    return true;
  }

  return decoded.expiresAt - skewMs <= now;
}
