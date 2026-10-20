// `ForbiddenView` suite (COU-275, T5 / S6).
//
// The 403 view is announced, offers no retry (retrying a permission failure loops), and
// says what the person can do about it instead of echoing the server's prose.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

import { ForbiddenView } from "./forbidden-view";

const t = i18n.getFixedT(null, "console");

describe("ForbiddenView", () => {
  it("announces an access denial and explains it", () => {
    render(<ForbiddenView />);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent(t("forbidden.title"));
    expect(alert).toHaveTextContent(t("forbidden.message"));
  });

  it("has no axe violations", async () => {
    const { container } = render(<ForbiddenView />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
