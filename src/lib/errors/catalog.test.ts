import { describe, expect, it } from "vitest";

import { i18n } from "../i18n";
import { UA_ERROR_CODES, resolveApiErrorKey, uaErrorKey } from "./catalog";

describe("UA-* error catalog", () => {
  it.each(
    UA_ERROR_CODES.flatMap((code) =>
      (["es", "en", "pt"] as const).map((language) => ({ code, language })),
    ),
  )("has $language copy for $code", ({ code, language }) => {
    expect(
      i18n.exists(uaErrorKey(code), { lng: language }),
      `${code} has no copy in ${language}`,
    ).toBe(true);
  });

  it("has family fallback copy in every shipped language", () => {
    for (const key of [
      "error.genericMessage",
      "error.family.request",
      "error.family.server",
    ] as const) {
      for (const language of ["es", "en", "pt"] as const) {
        expect(i18n.exists(key, { lng: language }), `${key} has no copy in ${language}`).toBe(true);
      }
    }
  });

  it("holds unique, well-formed codes", () => {
    expect(new Set(UA_ERROR_CODES).size).toBe(UA_ERROR_CODES.length);
    for (const code of UA_ERROR_CODES) {
      expect(code).toMatch(/^UA-[A-Z]{3,4}-\d{3}$/);
    }
  });

  it("maps a known code to its exact key", () => {
    expect(resolveApiErrorKey("UA-AUTH-002", 401)).toBe("error.ua.UA-AUTH-002");
  });

  it.each([
    ["UA-XXX-999", 500, "error.family.server"],
    ["UA-XXX-999", 404, "error.family.request"],
    ["UA-XXX-999", undefined, "error.genericMessage"],
    [undefined, 502, "error.family.server"],
    [undefined, 404, "error.family.request"],
    [undefined, undefined, "error.genericMessage"],
  ])("falls back by family for unknown code %s with status %s", (code, status, expected) => {
    expect(resolveApiErrorKey(code, status)).toBe(expected);
  });
});
