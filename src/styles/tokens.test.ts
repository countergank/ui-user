import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const tokensCss = readFileSync(resolve(here, "tokens.css"), "utf8");
const tailwindConfig = readFileSync(resolve(here, "../../tailwind.config.js"), "utf8");

const TONES = ["success", "warning", "danger", "info"];
const TINT_ALPHA = 0.14;
const TINT_LABEL = "14%";
const AA = 4.5;

interface Hsl {
  h: number;
  s: number;
  l: number;
}

interface TokenMode {
  readonly name: string;
  readonly tokens: Map<string, string>;
}

type Rgb = [number, number, number];

const HSL_TRIPLE = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/;

const parseHsl = (raw: string, token: string, mode: string): Hsl => {
  const match = HSL_TRIPLE.exec(raw);
  if (match === null) {
    throw new Error(`${mode}: ${token} is not a bare HSL triple ("${raw}")`);
  }
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
};

const selectorBody = (css: string, selector: string): string => {
  const start = css.indexOf(`${selector} {`);
  const open = start === -1 ? -1 : css.indexOf("{", start);
  const close = open === -1 ? -1 : css.indexOf("}", open);
  if (close === -1) {
    throw new Error(`tokens.css is missing a \`${selector} { ... }\` block`);
  }
  return css.slice(open + 1, close);
};

const declarations = (selector: string): Map<string, string> => {
  const body = selectorBody(tokensCss, selector).replace(/\/\*[\s\S]*?\*\//g, "");
  const parsed = new Map<string, string>();
  for (const line of body.split("\n")) {
    const entry = line.trim();
    if (!entry.startsWith("--")) continue;
    const colon = entry.indexOf(":");
    const end = entry.lastIndexOf(";");
    if (colon <= 0 || end <= colon) continue;
    parsed.set(entry.slice(0, colon).trim(), entry.slice(colon + 1, end).trim());
  }
  return parsed;
};

const MODES: readonly TokenMode[] = [
  { name: "light", tokens: declarations(":root") },
  { name: "dark", tokens: declarations(".dark") },
];

const readToken = (tokens: Map<string, string>, token: string, mode: string): Hsl => {
  const raw = tokens.get(token);
  if (raw === undefined) {
    throw new Error(`${mode}: tokens.css does not define ${token}`);
  }
  return parseHsl(raw, token, mode);
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hue = h / 60;
  const second = chroma * (1 - Math.abs((hue % 2) - 1));
  const base = lightness - chroma / 2;
  let channels: Rgb;
  if (hue < 1) channels = [chroma, second, 0];
  else if (hue < 2) channels = [second, chroma, 0];
  else if (hue < 3) channels = [0, chroma, second];
  else if (hue < 4) channels = [0, second, chroma];
  else if (hue < 5) channels = [second, 0, chroma];
  else channels = [chroma, 0, second];
  const [r, g, b] = channels;
  return [clamp01(r + base), clamp01(g + base), clamp01(b + base)];
};

const srgbToLinear = (channel: number): number =>
  channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const relativeLuminance = ([r, g, b]: Rgb): number =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);

const contrastRatio = (foreground: Rgb, background: Rgb): number => {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

const composite = (foreground: Rgb, alpha: number, background: Rgb): Rgb => {
  const [fr, fg, fb] = foreground;
  const [br, bg, bb] = background;
  return [
    fr * alpha + br * (1 - alpha),
    fg * alpha + bg * (1 - alpha),
    fb * alpha + bb * (1 - alpha),
  ];
};

const toHex = ([r, g, b]: Rgb): string =>
  `#${[r, g, b]
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`.toUpperCase();

const pairMessage = (
  mode: string,
  label: string,
  foreground: Rgb,
  background: Rgb,
  ratio: number,
): string =>
  `${mode}: ${label} measures ${ratio.toFixed(2)}:1 (AA needs ${AA.toFixed(1)}:1) — ` +
  `text ${toHex(foreground)} on background ${toHex(background)}`;

describe("design tokens — WCAG 2.2 AA contrast", () => {
  for (const { name: mode, tokens } of MODES) {
    describe(`${mode} mode`, () => {
      const background = hslToRgb(readToken(tokens, "--background", mode));
      const card = hslToRgb(readToken(tokens, "--card", mode));

      it("keeps --foreground AA on --background", () => {
        const text = hslToRgb(readToken(tokens, "--foreground", mode));
        const ratio = contrastRatio(text, background);
        expect(
          ratio,
          pairMessage(mode, "--foreground on --background", text, background, ratio),
        ).toBeGreaterThanOrEqual(AA);
      });

      it("keeps --card-foreground AA on --card", () => {
        const text = hslToRgb(readToken(tokens, "--card-foreground", mode));
        const ratio = contrastRatio(text, card);
        expect(
          ratio,
          pairMessage(mode, "--card-foreground on --card", text, card, ratio),
        ).toBeGreaterThanOrEqual(AA);
      });

      for (const tone of TONES) {
        it(`keeps ${tone} text AA on its own ${TINT_LABEL} tint`, () => {
          const tint = composite(
            hslToRgb(readToken(tokens, `--${tone}`, mode)),
            TINT_ALPHA,
            background,
          );
          const text = hslToRgb(readToken(tokens, `--${tone}-foreground`, mode));
          const ratio = contrastRatio(text, tint);
          const message = pairMessage(
            mode,
            `--${tone}-foreground on --${tone} / ${TINT_LABEL}`,
            text,
            tint,
            ratio,
          );
          expect(ratio, message).toBeGreaterThanOrEqual(AA);
        });
      }

      for (const tone of TONES) {
        it(`keeps ${tone} text AA on its own ${TINT_LABEL} tint over the card`, () => {
          const tint = composite(hslToRgb(readToken(tokens, `--${tone}`, mode)), TINT_ALPHA, card);
          const text = hslToRgb(readToken(tokens, `--${tone}-foreground`, mode));
          const ratio = contrastRatio(text, tint);
          const message = pairMessage(
            mode,
            `--${tone}-foreground on --${tone} / ${TINT_LABEL} over --card`,
            text,
            tint,
            ratio,
          );
          expect(ratio, message).toBeGreaterThanOrEqual(AA);
        });
      }

      it("keeps --primary-foreground AA on the --primary fill", () => {
        const fill = hslToRgb(readToken(tokens, "--primary", mode));
        const text = hslToRgb(readToken(tokens, "--primary-foreground", mode));
        const ratio = contrastRatio(text, fill);
        expect(
          ratio,
          pairMessage(mode, "--primary-foreground on --primary", text, fill, ratio),
        ).toBeGreaterThanOrEqual(AA);
      });

      it("keeps --destructive-foreground AA on the --destructive button", () => {
        const button = hslToRgb(readToken(tokens, "--destructive", mode));
        const text = hslToRgb(readToken(tokens, "--destructive-foreground", mode));
        const ratio = contrastRatio(text, button);
        const message = pairMessage(
          mode,
          "--destructive-foreground on --destructive",
          text,
          button,
          ratio,
        );
        expect(ratio, message).toBeGreaterThanOrEqual(AA);
      });

      it("keeps --muted-foreground AA on every surface it is used on", () => {
        const text = hslToRgb(readToken(tokens, "--muted-foreground", mode));
        const surfaces: readonly (readonly [string, Rgb])[] = [
          ["--muted", hslToRgb(readToken(tokens, "--muted", mode))],
          ["--background", background],
          ["--card", card],
        ];
        for (const [surface, background] of surfaces) {
          const ratio = contrastRatio(text, background);
          expect(
            ratio,
            pairMessage(mode, `--muted-foreground on ${surface}`, text, background, ratio),
          ).toBeGreaterThanOrEqual(AA);
        }
      });

      it("defines --seg-thumb (the segmented-control thumb is not --card)", () => {
        expect(tokens.has("--seg-thumb"), `${mode}: tokens.css must define --seg-thumb`).toBe(true);
        expect(() => readToken(tokens, "--seg-thumb", mode)).not.toThrow();
      });
    });
  }

  it("maps every Tailwind tone variable to a token defined in both blocks", () => {
    for (const tone of TONES) {
      for (const variable of [`--${tone}`, `--${tone}-foreground`]) {
        expect(
          tailwindConfig,
          `tailwind.config.js must expose ${variable} in the ${tone} scale`,
        ).toContain(`hsl(var(${variable}) / <alpha-value>)`);
        for (const { name: mode, tokens } of MODES) {
          expect(
            tokens.has(variable),
            `${mode}: tailwind.config.js maps ${variable}, but tokens.css does not define it`,
          ).toBe(true);
        }
      }
    }
  });
});
