// Component tests for the presentational AppEnvBadge (COU-125/ADR-11, ARCH-2, a11y).
// Label assertions are derived from the i18n resources (COU-253).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

import { AppEnvBadge } from "./env-badge";

describe("AppEnvBadge", () => {
  it("renders the environment and api base url", () => {
    render(<AppEnvBadge mode="staging" apiBaseUrl="https://stg-api.countergank.com" />);

    expect(screen.getByText(i18n.t("home.environment.modeLabel"))).toBeInTheDocument();
    expect(screen.getByText("staging")).toBeInTheDocument();
    expect(screen.getByText(i18n.t("home.environment.apiBaseLabel"))).toBeInTheDocument();
    expect(screen.getByText("https://stg-api.countergank.com")).toBeInTheDocument();
  });

  it("renders the production mode", () => {
    render(<AppEnvBadge mode="production" apiBaseUrl="https://api.countergank.com" />);
    expect(screen.getByText("production")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <AppEnvBadge mode="development" apiBaseUrl="http://localhost:8080" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
