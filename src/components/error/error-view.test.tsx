import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

import { ErrorView } from "./error-view";

describe("ErrorView", () => {
  it("announces the error via role=alert with title and message", () => {
    render(<ErrorView title={i18n.t("error.dataFetchTitle")} message="Network timeout" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.dataFetchTitle"));
    expect(alert).toHaveTextContent("Network timeout");
  });

  it("invokes the retry action when the button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorView title="Boom" message="Details" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: i18n.t("error.retry") }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("omits the retry button when no handler is provided", () => {
    render(<ErrorView title="Boom" message="Details" />);
    expect(screen.queryByRole("button", { name: i18n.t("error.retry") })).not.toBeInTheDocument();
  });

  it("shows the traceId with a copy action when one is provided", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ErrorView title="Boom" message="Details" traceId="trace-123" />);

    expect(screen.getByText("trace-123")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: i18n.t("error.traceId.copy") }));
    expect(writeText).toHaveBeenCalledWith("trace-123");
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
  });

  it("does not show a traceId section when none is provided", () => {
    render(<ErrorView title="Boom" message="Details" />);

    expect(
      screen.queryByRole("button", { name: i18n.t("error.traceId.copy") }),
    ).not.toBeInTheDocument();
  });

  it("confirms the copy and reverts the label after a moment", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(() => Promise.resolve());
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      render(<ErrorView title="Boom" message="Details" traceId="trace-123" />);

      fireEvent.click(screen.getByRole("button", { name: i18n.t("error.traceId.copy") }));
      await act(async () => {
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith("trace-123");
      expect(
        screen.getByRole("button", { name: i18n.t("error.traceId.copied") }),
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2500);
      });
      expect(
        screen.getByRole("button", { name: i18n.t("error.traceId.copy") }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });

  it("shows a failure label when the clipboard write fails and reverts it", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(() => Promise.reject(new Error("denied")));
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      render(<ErrorView title="Boom" message="Details" traceId="trace-123" />);

      fireEvent.click(screen.getByRole("button", { name: i18n.t("error.traceId.copy") }));
      await act(async () => {
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith("trace-123");
      expect(
        screen.getByRole("button", { name: i18n.t("error.traceId.copyFailed") }),
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2500);
      });
      expect(
        screen.getByRole("button", { name: i18n.t("error.traceId.copy") }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ErrorView
        title={i18n.t("error.dataFetchTitle")}
        message="Network timeout"
        onRetry={() => undefined}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
