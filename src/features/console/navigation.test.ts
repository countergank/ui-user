// Manifest lookup (COU-278, T2 / S7).
//
// The breadcrumb and the route announcer both need "which section is this path in?". It is
// pure, so the two rules that actually matter are pinned here: a detail page belongs to its
// section, and the console root never swallows its own children.
import { describe, expect, it } from "vitest";

import { CONSOLE_NAV, activeNavItem } from "./navigation";

describe("activeNavItem", () => {
  it("matches a section route exactly", () => {
    expect(activeNavItem(CONSOLE_NAV, "/app/users")?.to).toBe("/app/users");
  });

  it("keeps a detail page inside its section", () => {
    expect(activeNavItem(CONSOLE_NAV, "/app/users/42")?.to).toBe("/app/users");
  });

  it("does not let the console root claim its own children", () => {
    expect(activeNavItem(CONSOLE_NAV, "/app/audit")?.to).toBe("/app/audit");
  });

  it("matches the console root on its own", () => {
    expect(activeNavItem(CONSOLE_NAV, "/app")?.to).toBe("/app");
  });

  it("resolves an unknown console path to nothing, so the caller can fall back", () => {
    expect(activeNavItem(CONSOLE_NAV, "/app/unknown")).toBeUndefined();
    expect(activeNavItem(CONSOLE_NAV, "/profile")).toBeUndefined();
  });
});
