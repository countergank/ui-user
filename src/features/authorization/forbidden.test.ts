// `isForbiddenError` suite (COU-275, T5 / S6).
//
// The API answers 403 as `{ statusCode: 403, code: "UA-SEC-002" }`
// (`api-user/src/common/errors/error-kind.ts:173`), and the HTTP client keeps both the
// status and the code on the `AppError` it throws. Either one is enough evidence; a
// different failure is not.
import { describe, expect, it } from "vitest";

import { AppError, DataFetchError } from "@/lib/errors";

import { isForbiddenError } from "./forbidden";

describe("isForbiddenError", () => {
  it("recognizes a 403 status", () => {
    expect(isForbiddenError(new AppError("Access denied", { status: 403 }))).toBe(true);
  });

  it("recognizes the API's forbidden code", () => {
    expect(isForbiddenError(new AppError("Access denied", { code: "UA-SEC-002" }))).toBe(true);
  });

  it("does not treat another status as forbidden", () => {
    expect(isForbiddenError(new DataFetchError("nope", { status: 401 }))).toBe(false);
  });

  it("does not treat an unrelated failure as forbidden", () => {
    expect(isForbiddenError(new Error("boom"))).toBe(false);
  });
});
