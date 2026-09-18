// Unit tests for typed env handling (COU-125, env handling policy).
import { describe, expect, it } from "vitest";

import { type EnvShape, requireEnv, resolveEnv, resolveMode } from "./env";
import { AppError } from "./errors";

describe("resolveMode", () => {
  it("maps known Vite modes to app environments", () => {
    expect(resolveMode("development")).toBe("development");
    expect(resolveMode("staging")).toBe("staging");
    expect(resolveMode("production")).toBe("production");
  });

  it("safe-falls to development for unknown or empty modes", () => {
    expect(resolveMode("")).toBe("development");
    expect(resolveMode("custom")).toBe("development");
    expect(resolveMode(undefined as unknown as string)).toBe("development");
  });
});

describe("requireEnv", () => {
  it("returns the present value", () => {
    expect(requireEnv({ VITE_API_BASE_URL: "http://x" }, "VITE_API_BASE_URL")).toBe("http://x");
  });

  it("throws AppError with code ENV_MISSING when undefined", () => {
    expect(() => requireEnv({}, "VITE_API_BASE_URL")).toThrowError(AppError);
    try {
      requireEnv({}, "VITE_API_BASE_URL");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe("ENV_MISSING");
      expect((err as AppError).message).toContain("VITE_API_BASE_URL");
    }
  });

  it("throws AppError when empty string", () => {
    expect(() => requireEnv({ VITE_API_BASE_URL: "" }, "VITE_API_BASE_URL")).toThrowError(AppError);
  });
});

describe("resolveEnv", () => {
  it("freezes the snapshot so config cannot be mutated", () => {
    const env = resolveEnv({ VITE_API_BASE_URL: "http://x" });
    expect(Object.isFrozen(env)).toBe(true);
  });

  it("builds a typed EnvShape from a present value", () => {
    const env = resolveEnv({ VITE_API_BASE_URL: "http://x" });
    expect(env.apiBaseUrl).toBe("http://x");
  });

  it("fails fast when a required variable is missing", () => {
    const build = (): EnvShape => resolveEnv({});
    expect(build).toThrowError(AppError);
  });
});
