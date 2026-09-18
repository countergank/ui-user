// Component tests for the presentational AppEnvBadge (COU-125/ADR-11, ARCH-2, a11y).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { AppEnvBadge } from "./env-badge";

describe("AppEnvBadge", () => {
  it("renders the environment and api base url", () => {
    render(<AppEnvBadge mode="staging" apiBaseUrl="https://stg-api.countergank.com" />);

    expect(screen.getByText("Environment:")).toBeInTheDocument();
    expect(screen.getByText("staging")).toBeInTheDocument();
    expect(screen.getByText("API base:")).toBeInTheDocument();
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
