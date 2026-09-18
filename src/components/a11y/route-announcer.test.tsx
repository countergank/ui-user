// Component tests for the RouteAnnouncer (a11y route-announcer rule, ARCH-6).
// The announcer updates a polite live region ~100ms after each message change.
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RouteAnnouncer } from "./route-announcer";

describe("RouteAnnouncer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts empty and announces the message after the delay", () => {
    render(<RouteAnnouncer message="Home page loaded" />);

    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(status).toHaveTextContent("Home page loaded");
  });

  it("re-announces a new message after the route changes", () => {
    const { rerender } = render(<RouteAnnouncer message="Home page loaded" />);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender(<RouteAnnouncer message="About page loaded" />);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByRole("status")).toHaveTextContent("About page loaded");
  });
});
