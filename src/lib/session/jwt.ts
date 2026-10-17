/**
 * Access-token expiry reading (COU-273, T3).
 *
 * The server owns the TTL (`api-user` signs the access token with `expiresIn: '15m'`,
 * configurable), so the client reads the standard `exp` claim instead of hardcoding a
 * duration that would silently drift from the server. Nothing here verifies the
 * signature: that is the server's job, and a tampered token fails there anyway.
 */

export interface AccessTokenClaims {
  sub?: string;
  exp?: number;
  iat?: number;
  email?: string;
  role?: string;
}

export interface DecodedAccessToken {
  sub: string | null;
  /** Absolute expiry in milliseconds since the epoch, or `null` when the token carries none. */
  expiresAt: number | null;
}

/**
 * Refresh this long before the token actually dies. Long enough to cover a slow round
 * trip, short enough not to refresh while the token is still comfortably valid.
 */
export const DEFAULT_EXPIRY_SKEW_MS = 15_000;

function base64UrlToBase64(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  return normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
}

/** Decode the payload of a JWT-shaped token, or `null` when it is not one. */
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

/** Milliseconds left before expiry, clamped at zero. Unreadable tokens count as expired. */
export function millisecondsUntilExpiry(token: string, now: number = Date.now()): number {
  const decoded = decodeAccessToken(token);
  if (decoded?.expiresAt == null) {
    return 0;
  }

  return Math.max(0, decoded.expiresAt - now);
}

/**
 * Is the token inside the refresh margin? A token we cannot read is reported expired:
 * failing closed sends the user through refresh instead of firing a doomed request.
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
