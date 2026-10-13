// Unit tests for the theme primitives (`src/lib/theme/theme.ts`).
// The pure helpers (`isThemePreference`, `resolveTheme`) carry the real logic and
// are tested without a DOM; the storage/DOM helpers are tested against jsdom.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import { matchMediaStub } from "@/test/setup";

import {
  DARK_MEDIA_QUERY,
  THEME_CYCLE,
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePreference,
  nextPreference,
  readStoredPreference,
  resolveTheme,
  systemPrefersDark,
  writeStoredPreference,
} from "./theme";

// Resolved through node path arithmetic (not `new URL(...)`, which Vite rewrites
// into an asset URL and would break the file path lookup).
const INDEX_HTML_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../../index.html");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isThemePreference", () => {
  it.each(["system", "light", "dark"])("accepts the %s preference", (value) => {
    expect(isThemePreference(value)).toBe(true);
  });

  it.each([
    ["an unknown string", "DARK"],
    ["an empty string", ""],
    ["a JSON payload", '{"theme":"dark"}'],
    ["null", null],
    ["undefined", undefined],
    ["a number", 1],
    ["a boolean", true],
    ["an object", { theme: "dark" }],
    ["an array", ["dark"]],
  ])("rejects %s", (_label, value) => {
    expect(isThemePreference(value)).toBe(false);
  });
});

describe("resolveTheme", () => {
  it('resolves "system" from the OS preference, in both directions', () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it('ignores a dark OS preference when the choice is explicitly "light"', () => {
    expect(resolveTheme("light", true)).toBe("light");
  });

  it('ignores a light OS preference when the choice is explicitly "dark"', () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("THEME_CYCLE", () => {
  it("contains exactly the three preferences, in cycle order", () => {
    expect([...THEME_CYCLE]).toEqual(["light", "dark", "system"]);
  });

  it("holds only preferences the storage layer accepts, without duplicates", () => {
    expect(THEME_CYCLE.every(isThemePreference)).toBe(true);
    expect(new Set(THEME_CYCLE).size).toBe(THEME_CYCLE.length);
  });
});

describe("nextPreference", () => {
  it.each([
    ["light", "dark"],
    ["dark", "system"],
    ["system", "light"],
  ] as const)("advances %s to %s", (current, next) => {
    expect(nextPreference(current)).toBe(next);
  });

  it("wraps around back to the starting point after a full cycle", () => {
    const afterOneCycle = nextPreference(nextPreference(nextPreference("system")));

    expect(afterOneCycle).toBe("system");
  });

  it("only ever returns a member of the cycle", () => {
    for (const preference of THEME_CYCLE) {
      expect(isThemePreference(nextPreference(preference))).toBe(true);
    }
  });
});

describe("readStoredPreference", () => {
  it('returns "system" when nothing is stored', () => {
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(readStoredPreference()).toBe("system");
  });

  it.each(["light", "dark", "system"] as const)(
    'returns the stored "%s" preference verbatim',
    (preference) => {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      expect(readStoredPreference()).toBe(preference);
    },
  );

  it.each([
    ["garbage", "banana"],
    ["a JSON payload", '{"theme":"dark"}'],
    ["a wrong-typed value", "true"],
    ["an empty string", ""],
  ])('falls back to "system" for %s', (_label, stored) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, stored);
    expect(readStoredPreference()).toBe("system");
  });

  it('falls back to "system" when localStorage access throws', () => {
    // Patch the prototype, not `window.localStorage`: jsdom's Storage is a Proxy
    // that swallows instance-level method assignment (it stores it as an item).
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: storage is disabled");
    });

    expect(readStoredPreference()).toBe("system");
    expect(getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  });
});

describe("writeStoredPreference", () => {
  it("stores the bare preference string, not JSON", () => {
    writeStoredPreference("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    writeStoredPreference("system");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("does not throw when the write fails", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => {
      writeStoredPreference("dark");
    }).not.toThrow();
    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
  });
});

describe("systemPrefersDark", () => {
  it("reports the OS preference from matchMedia", () => {
    matchMediaStub.setDark(true);
    expect(systemPrefersDark()).toBe(true);

    matchMediaStub.setDark(false);
    expect(systemPrefersDark()).toBe(false);
  });

  it("returns false when matchMedia is unavailable", () => {
    matchMediaStub.restore();

    try {
      expect(systemPrefersDark()).toBe(false);
    } finally {
      matchMediaStub.install();
    }
  });

  it("returns false when matchMedia itself throws", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(() => {
      throw new Error("matchMedia is not supported");
    });

    expect(systemPrefersDark()).toBe(false);
    expect(matchMedia).toHaveBeenCalledWith(DARK_MEDIA_QUERY);
  });
});

describe("applyTheme", () => {
  it("adds the dark class and the dark color-scheme together", () => {
    applyTheme("dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("removes the dark class and sets the light color-scheme together", () => {
    applyTheme("dark");
    applyTheme("light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

describe("index.html pre-paint theme bootstrap", () => {
  const html = readFileSync(INDEX_HTML_PATH, "utf8");

  it("inlines a script before the module script", () => {
    const inlineStart = html.indexOf("<script>");
    const inlineEnd = html.indexOf("</script>", inlineStart);
    const moduleStart = html.indexOf('type="module"');

    expect(inlineStart, "index.html must inline a pre-paint <script>").toBeGreaterThan(-1);
    expect(moduleStart, "index.html must still load the module entry").toBeGreaterThan(-1);
    expect(inlineStart, "the inline script must run before first paint").toBeLessThan(moduleStart);
    expect(inlineEnd).toBeGreaterThan(inlineStart);
  });

  it("uses the same storage key and preference vocabulary as theme.ts", () => {
    const inlineStart = html.indexOf("<script>");
    const inlineScript = html.slice(inlineStart, html.indexOf("</script>", inlineStart));

    // Drift guard: the inline script cannot import the constant, so renaming
    // THEME_STORAGE_KEY without updating index.html must fail this suite.
    expect(inlineScript).toContain(THEME_STORAGE_KEY);

    for (const preference of ["system", "light", "dark"]) {
      expect(inlineScript).toContain(`"${preference}"`);
    }
    expect(inlineScript).toContain("prefers-color-scheme: dark");
    expect(inlineScript).toContain("document.documentElement");
  });

  it("guards the inline script against storage and matchMedia failures", () => {
    const inlineStart = html.indexOf("<script>");
    const inlineScript = html.slice(inlineStart, html.indexOf("</script>", inlineStart));

    expect(inlineScript).toContain("try");
    expect(inlineScript).toContain("catch");
  });
});
