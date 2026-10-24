import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "..");

const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".js", ".jsx", ".mjs", ".cjs", ".html"]);

const HEX_COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

const CSS_BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;

const walk = (dir: string): string[] => {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.isFile()) found.push(full);
  }
  return found;
};

const sourceFiles = walk(srcRoot).filter((file) => SCANNED_EXTENSIONS.has(extname(file)));

describe("src/ has no hardcoded hex colors", () => {
  it("finds source files to scan (the walk is not vacuous)", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it("uses design tokens instead of hex color literals everywhere under src/", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles) {
      const raw = readFileSync(file, "utf8");
      const text = extname(file) === ".css" ? raw.replace(CSS_BLOCK_COMMENT, "") : raw;

      text.split("\n").forEach((line, index) => {
        const matches = line.match(HEX_COLOR);
        if (matches === null) return;
        for (const match of matches) {
          offenders.push(
            `${relative(srcRoot, file)}:${String(index + 1)}  found ${match}  →  ${line.trim()}`,
          );
        }
      });
    }

    expect(
      offenders,
      "Hardcoded hex color found. Use a design token instead: a Tailwind utility " +
        "(bg-primary, text-muted-foreground, border-success/30) or hsl(var(--token)). " +
        "See docs/design-system.md.",
    ).toEqual([]);
  });
});
