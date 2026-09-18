// Unit tests for the typed error model (ARCH-4, p1-error-instances).
import { describe, expect, it } from "vitest";

import { AppError, DataFetchError, RouteError, toError } from "./errors";

describe("typed errors", () => {
  it("AppError carries a machine-readable code and http status", () => {
    const err = new AppError("boom", { code: "E_BOOM", status: 503 });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AppError");
    expect(err.code).toBe("E_BOOM");
    expect(err.status).toBe(503);
    expect(err.message).toBe("boom");
  });

  it("AppError propagates a cause when provided", () => {
    const cause = new Error("root");
    const err = new AppError("wrapped", { cause });
    expect(err.cause).toBe(cause);
  });

  it("DataFetchError is an AppError with its own name", () => {
    const err = new DataFetchError("fetch failed", { status: 404 });
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("DataFetchError");
    expect(err.status).toBe(404);
  });

  it("RouteError is an AppError with its own name", () => {
    const err = new RouteError("route failed");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("RouteError");
  });
});

describe("toError", () => {
  it("returns Error instances unchanged", () => {
    const err = new Error("keep me");
    expect(toError(err)).toBe(err);
  });

  it("wraps plain strings into Error", () => {
    const err = toError("plain message");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("plain message");
  });

  it("normalizes arbitrary thrown values to a generic message", () => {
    const err = toError({ arbitrary: true });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("An unexpected error occurred.");
  });
});
