// Component tests for the RouteAnnouncer (a11y route-announcer rule, ARCH-6).
// The announcer updates a polite live region ~100ms after each message change;
// the messages are derived from the i18n resources like the shell produces them
// (COU-253).
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "@/lib/i18n";

import { RouteAnnouncer } from "./route-announcer";

describe("RouteAnnouncer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts empty and announces the message after the delay", () => {
    render(<RouteAnnouncer message={i18n.t("shell.routeAnnouncer.loaded", { title: "Home" })} />);

    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(status).toHaveTextContent(i18n.t("shell.routeAnnouncer.loaded", { title: "Home" }));
  });

  it("re-announces a new message after the route changes", () => {
    const { rerender } = render(
      <RouteAnnouncer message={i18n.t("shell.routeAnnouncer.loaded", { title: "Home" })} />,
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender(
      <RouteAnnouncer message={i18n.t("shell.routeAnnouncer.loaded", { title: "About" })} />,
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      i18n.t("shell.routeAnnouncer.loaded", { title: "About" }),
    );
  });
});
