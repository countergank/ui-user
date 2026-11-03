import { describe, expect, it } from "vitest";

import { i18n } from "../i18n";
import { UA_ERROR_CODES, resolveApiErrorKey, uaErrorKey } from "./catalog";

describe("UA-* error catalog", () => {
  it("walks every catalog code and finds copy in every shipped language", () => {
    for (const code of UA_ERROR_CODES) {
      const key = uaErrorKey(code);
      for (const language of ["es", "en", "pt"] as const) {
        expect(i18n.exists(key, { lng: language }), `${code} has no copy in ${language}`).toBe(
          true,
        );
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
