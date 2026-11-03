import { describe, expect, it } from "vitest";

import { AppError } from "../errors";
import { resolveApiErrorPresentation } from "./resolve";

const RAW_BACKEND_MESSAGE = "jwt expired: E_TOKEN_INVALID signature verification failed";

describe("resolveApiErrorPresentation", () => {
  it("maps values that are not AppError to a page-level generic message", () => {
    expect(resolveApiErrorPresentation(undefined)).toEqual({
      level: "page",
      messageKey: "error.genericMessage",
      traceId: null,
    });
    expect(resolveApiErrorPresentation("boom")).toEqual({
      level: "page",
      messageKey: "error.genericMessage",
      traceId: null,
    });
    expect(resolveApiErrorPresentation(new Error("boom"))).toEqual({
      level: "page",
      messageKey: "error.genericMessage",
      traceId: null,
    });
  });

  it("maps an AppError without a code to a page-level generic message and keeps its traceId", () => {
    const error = new AppError(RAW_BACKEND_MESSAGE, { traceId: "trace-1" });

    expect(resolveApiErrorPresentation(error)).toEqual({
      level: "page",
      messageKey: "error.genericMessage",
      traceId: "trace-1",
    });
  });

  it("maps an AppError without a code and without a traceId to a null traceId", () => {
    const error = new AppError(RAW_BACKEND_MESSAGE);

    expect(resolveApiErrorPresentation(error).traceId).toBeNull();
  });

  it("maps a UA code to its catalog key at page level for a server failure", () => {
    const error = new AppError(RAW_BACKEND_MESSAGE, {
      code: "UA-COM-001",
      status: 500,
      traceId: "trace-2",
    });

    expect(resolveApiErrorPresentation(error)).toEqual({
      level: "page",
      messageKey: "error.ua.UA-COM-001",
      traceId: "trace-2",
    });
  });

  it("maps a UA code with a validation status to form level", () => {
    for (const status of [400, 409, 422]) {
      const error = new AppError(RAW_BACKEND_MESSAGE, { code: "UA-COM-004", status });

      expect(resolveApiErrorPresentation(error)).toEqual({
        level: "form",
        messageKey: "error.ua.UA-COM-004",
        traceId: null,
      });
    }
  });

  it("keeps non-validation 4xx UA failures at page level", () => {
    for (const status of [401, 403, 404, 429]) {
      const error = new AppError(RAW_BACKEND_MESSAGE, { code: "UA-USR-003", status });

      const presentation = resolveApiErrorPresentation(error);
      expect(presentation.level).toBe("page");
      expect(presentation.messageKey).toBe("error.ua.UA-USR-003");
    }
  });

  it("keeps a UA failure without a status at page level", () => {
    const error = new AppError(RAW_BACKEND_MESSAGE, { code: "UA-COM-002" });

    expect(resolveApiErrorPresentation(error).level).toBe("page");
  });

  it("falls back to the family key for an AppError carrying a non-UA code", () => {
    const serverError = new AppError(RAW_BACKEND_MESSAGE, { code: "HTTP_ERROR", status: 503 });
    expect(resolveApiErrorPresentation(serverError)).toEqual({
      level: "page",
      messageKey: "error.family.server",
      traceId: null,
    });

    const requestError = new AppError(RAW_BACKEND_MESSAGE, { code: "HTTP_ERROR", status: 400 });
    expect(resolveApiErrorPresentation(requestError)).toEqual({
      level: "page",
      messageKey: "error.family.request",
      traceId: null,
    });
  });

  it("falls back by family for an AppError without a code but with a status", () => {
    const serverError = new AppError(RAW_BACKEND_MESSAGE, { status: 502, traceId: "trace-7" });

    expect(resolveApiErrorPresentation(serverError)).toEqual({
      level: "page",
      messageKey: "error.family.server",
      traceId: "trace-7",
    });

    const requestError = new AppError(RAW_BACKEND_MESSAGE, { status: 404 });

    expect(resolveApiErrorPresentation(requestError)).toEqual({
      level: "page",
      messageKey: "error.family.request",
      traceId: null,
    });
  });

  it("never exposes the backend message", () => {
    const error = new AppError(RAW_BACKEND_MESSAGE, {
      code: "UA-AUTH-002",
      status: 401,
      traceId: "trace-3",
    });

    const presentation = resolveApiErrorPresentation(error);
    expect(presentation).not.toHaveProperty("message");
    expect(JSON.stringify(presentation)).not.toContain("jwt expired");
    expect(presentation.messageKey).not.toBe(error.message);
  });
});
