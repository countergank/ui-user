import { expect } from "vitest";

/**
 * S4 guard (COU-271): no element declares a *design* decision through an inline `style`.
 * Radix owns inline mechanics (focus-trap sentinels, popper transforms, `--radix-*`);
 * colour, typography and spacing must come from token utilities — those are what this guard forbids.
 */
const FORBIDDEN_INLINE_DECLARATION =
  /(?:^|;)\s*(?:color|background|background-color|border|border-color|border-radius|box-shadow|font|font-family|font-size|font-weight|line-height|letter-spacing|fill|stroke|padding|margin|gap)\s*:/i;

export function expectNoAuthoredInlineStyles(container: HTMLElement): void {
  // The container itself counts: a primitive's own root is the easiest place to sneak a
  // design value in, and `querySelectorAll` never matches the element it is called on.
  const styled = [container, ...container.querySelectorAll("[style]")];

  for (const node of styled) {
    expect(node.getAttribute("style") ?? "").not.toMatch(FORBIDDEN_INLINE_DECLARATION);
  }
}
