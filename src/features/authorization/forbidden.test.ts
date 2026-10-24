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
