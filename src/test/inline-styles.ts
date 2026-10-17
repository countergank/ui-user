import { expect } from "vitest";

/**
 * S4 guard (COU-271): no element declares a *design* decision through an inline `style`.
 *
 * Radix owns inline mechanics — `pointer-events` on modal overlays and content, the
 * hidden sentinels' `outline`/`opacity`/`position`, popper transforms, `--radix-*`
 * custom properties. Those are how the library keeps a modal focus-trapped, not how this
 * codebase paints. Colour, typography and spacing must come from the token utilities, so
 * those are the properties this guard refuses to find inline.
 */
const FORBIDDEN_INLINE_DECLARATION =
  /(?:^|;)\s*(?:color|background|background-color|border|border-color|border-radius|font|font-family|font-size|font-weight|line-height|letter-spacing|fill|stroke|padding|margin|gap)\s*:/i;

export function expectNoAuthoredInlineStyles(container: HTMLElement): void {
  for (const node of container.querySelectorAll("[style]")) {
    expect(node.getAttribute("style")).not.toMatch(FORBIDDEN_INLINE_DECLARATION);
  }
}
