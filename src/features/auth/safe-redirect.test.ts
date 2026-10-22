// Redirect target validation (COU-281, T5 / S1, S5).
//
// `?redirect=` is attacker-controlled: the rule is an allowlist — a same-origin absolute
// path or nothing — so no hostile form has to be enumerated to be safe.
import { describe, expect, it } from "vitest";

import { DEFAULT_REDIRECT, resolveRedirectTarget } from "./safe-redirect";

function target(search: string): string {
  return resolveRedirectTarget(new URLSearchParams(search));
}

describe("resolveRedirectTarget", () => {
  it("falls back to the default when there is no redirect", () => {
    expect(target("")).toBe(DEFAULT_REDIRECT);
    expect(target("?redirect=")).toBe(DEFAULT_REDIRECT);
    // ADR-13: the console is the post-login destination, not the public home.
    expect(DEFAULT_REDIRECT).toBe("/app");
  });

  it("keeps an internal path, including its query and hash", () => {
    expect(target("?redirect=%2Fusers")).toBe("/users");
    expect(target("?redirect=%2Fusers%3Fpage%3D2%23top")).toBe("/users?page=2#top");
  });

  it.each([
    ["an absolute URL", "https://evil.example/steal"],
    ["a protocol-relative URL", "//evil.example/steal"],
    ["a backslash trick", "/\\evil.example"],
    ["a scheme without slashes", "javascript:alert(1)"],
    ["a bare relative path", "users"],
    ["a control character", "/users\nSet-Cookie: x"],
  ])("rejects %s", (_label, value) => {
    expect(target(`?redirect=${encodeURIComponent(value)}`)).toBe(DEFAULT_REDIRECT);
  });
});
