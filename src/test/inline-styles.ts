import { expect } from "vitest";

const FORBIDDEN_INLINE_DECLARATION =
  /(?:^|;)\s*(?:color|background|background-color|border|border-color|border-radius|box-shadow|font|font-family|font-size|font-weight|line-height|letter-spacing|fill|stroke|padding|margin|gap)\s*:/i;

export function expectNoAuthoredInlineStyles(container: HTMLElement): void {
  const styled = [container, ...container.querySelectorAll("[style]")];

  for (const node of styled) {
    expect(node.getAttribute("style") ?? "").not.toMatch(FORBIDDEN_INLINE_DECLARATION);
  }
}
