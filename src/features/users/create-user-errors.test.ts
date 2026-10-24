import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";

import { resolveCreateUserError } from "./create-user-errors";

describe("resolveCreateUserError", () => {
  it("maps UA-COM-004 to the email field", () => {
    expect(
      resolveCreateUserError(new AppError("taken", { code: "UA-COM-004", status: 409 })),
    ).toEqual({
      field: "email",
      messageKey: "create.errors.emailTaken",
    });
  });

  it("maps UA-COM-003 to the userName field", () => {
    expect(
      resolveCreateUserError(new AppError("taken", { code: "UA-COM-003", status: 409 })),
    ).toEqual({
      field: "userName",
      messageKey: "create.errors.userNameTaken",
    });
  });

  it("maps any PASSWORD_ code to the password field", () => {
    expect(
      resolveCreateUserError(new AppError("weak", { code: "PASSWORD_TOO_COMMON", status: 422 })),
    ).toEqual({
      field: "password",
      messageKey: "create.errors.weakPassword",
    });
  });

  it("returns null for codes the API does not attach to a field", () => {
    expect(
      resolveCreateUserError(new AppError("boom", { code: "HTTP_ERROR", status: 500 })),
    ).toBeNull();
    expect(resolveCreateUserError(new AppError("boom"))).toBeNull();
    expect(resolveCreateUserError("not an error")).toBeNull();
    expect(resolveCreateUserError(null)).toBeNull();
  });
});
