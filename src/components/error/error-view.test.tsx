import { render, screen } from "@testing-library/react";
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
