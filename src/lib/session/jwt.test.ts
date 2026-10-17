// Unit tests for access-token expiry reading (COU-273, T3).
//
// The server owns the 15-minute TTL; the client must not hardcode it. These tests pin
// the decode of the standard `exp` claim and the margin logic that decides "renew now".
import { describe, expect, it } from "vitest";

import { decodeAccessToken, isTokenExpired, millisecondsUntilExpiry } from "./jwt";

/** Build a syntactically valid, unsigned JWT with the given payload. */
function jwtWith(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

const NOW = 1_700_000_000_000; // ms

describe("access token expiry", () => {
  it("reads the exp claim as milliseconds since the epoch", () => {
    const token = jwtWith({ sub: "u1", exp: NOW / 1000 + 900 });

    const decoded = decodeAccessToken(token);

    expect(decoded?.sub).toBe("u1");
    expect(decoded?.expiresAt).toBe(NOW + 900_000);
  });

  it("returns null for anything that is not a three-part JWT", () => {
    expect(decodeAccessToken("not-a-jwt")).toBeNull();
    expect(decodeAccessToken("a.b")).toBeNull();
    expect(decodeAccessToken(`${jwtWith({}).split(".")[0]}.!!!.sig`)).toBeNull();
  });

  it("returns null when the payload has no exp", () => {
    expect(decodeAccessToken(jwtWith({ sub: "u1" }))?.expiresAt).toBeNull();
  });

  it("measures the time left, never negative", () => {
    const token = jwtWith({ exp: NOW / 1000 + 60 });

    expect(millisecondsUntilExpiry(token, NOW)).toBe(60_000);
    expect(millisecondsUntilExpiry(jwtWith({ exp: NOW / 1000 - 60 }), NOW)).toBe(0);
  });

  it("treats a token inside the safety margin as already expired", () => {
    const token = jwtWith({ exp: NOW / 1000 + 30 });

    expect(isTokenExpired(token, NOW, 30_000)).toBe(true);
    expect(isTokenExpired(token, NOW, 10_000)).toBe(false);
    expect(isTokenExpired(token, NOW)).toBe(false);
  });

  it("treats an unreadable token as expired rather than as valid", () => {
    expect(isTokenExpired("garbage", NOW)).toBe(true);
  });
});
