import { describe, expect, it } from "vitest";

import { defaultLanguage, languages, resources } from "./resources";

const EXPECTED_LANGUAGES = ["en", "es", "pt"] as const;

const PLACEHOLDER_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

const bundles = resources as unknown as Record<string, unknown>;

function flattenLeafPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return prefix ? [prefix] : [];
  }

  return entries
    .flatMap(([key, child]) => flattenLeafPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function collectLeaves(value: unknown, prefix = ""): Map<string, unknown> {
  const leaves = new Map<string, unknown>();

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    leaves.set(prefix, value);
    return leaves;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    for (const [childPath, leaf] of collectLeaves(child, path)) {
      leaves.set(childPath, leaf);
    }
  }

  return leaves;
}

function extractPlaceholders(value: string): string[] {
  const tokens = new Set<string>();
  for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
    tokens.add(match[1]);
  }
  return [...tokens].sort();
}

describe("i18n language parity", () => {
  it("declares exactly the supported product languages, without duplicates", () => {
    expect([...languages]).toEqual([...EXPECTED_LANGUAGES]);
    expect(new Set(languages).size).toBe(languages.length);
    expect(defaultLanguage).toBe("en");
  });

  it("provides a bundle for every declared language", () => {
    const missing = languages.filter((language) => bundles[language] === undefined);

    expect(missing, "Every declared language must ship a bundle.").toEqual([]);
  });

  it("keeps every language bundle at key parity with English, in both directions", () => {
    const reference = flattenLeafPaths(bundles[defaultLanguage]);

    for (const language of languages) {
      const paths = flattenLeafPaths(bundles[language]);
      const missing = reference.filter((path) => !paths.includes(path));
      const extra = paths.filter((path) => !reference.includes(path));

      expect(
        { language, missing, extra },
        `Language "${language}" must mirror the English key tree exactly.`,
      ).toEqual({ language, missing: [], extra: [] });
    }
  });

  it("keeps every {{...}} interpolation token identical across languages", () => {
    const referenceLeaves = collectLeaves(bundles[defaultLanguage]);

    for (const language of languages) {
      const leaves = collectLeaves(bundles[language]);

      for (const [path, referenceValue] of referenceLeaves) {
        if (typeof referenceValue !== "string") continue;

        const translated = leaves.get(path);
        if (typeof translated !== "string") continue;

        const expected = extractPlaceholders(referenceValue);
        const actual = extractPlaceholders(translated);

        expect(
          { key: path, language, expected, actual },
          `Key "${path}" in "${language}" must interpolate the same tokens as English.`,
        ).toEqual({ key: path, language, expected, actual });
      }
    }
  });

  it("has no empty or whitespace-only translations in any language", () => {
    for (const language of languages) {
      for (const [path, value] of collectLeaves(bundles[language])) {
        expect(typeof value, `${language}.${path} must be a string.`).toBe("string");
        expect(
          (value as string).trim().length,
          `${language}.${path} must not be empty.`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
