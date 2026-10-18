// Login error mapping (COU-281, T4).
//
// The four failures the ticket enumerates are API conditions, not field validations, so
// they all render as one form-level message. This module is the whole decision: HTTP
// status and `code` in, message key (or nothing) out. It is pure so the table can be
// asserted without a component.
import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";

import { resolveLoginError } from "./login-errors";

describe("resolveLoginError", () => {
  it.each([
    ["UA-AUTH-002", 401, "login.errors.invalidCredentials"],
    ["UA-AUTH-003", 423, "login.errors.locked"],
    ["UA-AUTH-004", 401, "login.errors.inactive"],
  ] as const)("maps %s to %s", (code, status, key) => {
    expect(resolveLoginError(new AppError("nope", { code, status }))).toBe(key);
  });

  it("maps a 429 to the rate-limit key even when the code is generic", () => {
    expect(resolveLoginError(new AppError("slow down", { code: "HTTP_ERROR", status: 429 }))).toBe(
      "login.errors.rateLimited",
    );
  });

  it("returns nothing for a failure the ticket does not enumerate", () => {
    expect(resolveLoginError(new AppError("boom", { code: "HTTP_ERROR", status: 500 }))).toBeNull();
    expect(resolveLoginError(new AppError("offline", { code: "NETWORK_ERROR" }))).toBeNull();
    expect(resolveLoginError(new Error("unexpected"))).toBeNull();
    expect(resolveLoginError(undefined)).toBeNull();
  });
});
