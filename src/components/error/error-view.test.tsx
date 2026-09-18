// Component tests for the accessible ErrorView (ARCH-4, a11y role=alert).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { ErrorView } from "./error-view";

describe("ErrorView", () => {
  it("announces the error via role=alert with title and message", () => {
    render(<ErrorView title="Could not load data" message="Network timeout" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not load data");
    expect(alert).toHaveTextContent("Network timeout");
  });

  it("invokes the retry action when the button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorView title="Boom" message="Details" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("omits the retry button when no handler is provided", () => {
    render(<ErrorView title="Boom" message="Details" />);
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ErrorView title="Could not load data" message="Network timeout" onRetry={() => undefined} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
