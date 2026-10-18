// Login page layout tests (COU-281, T3).
//
// The page is the one screen that lives outside the app shell, so it owns its own
// landmark and its own heading. These assertions are structural on purpose: the copy is
// read from the resources, and what must not be present (shell navigation, skip link) is
// the actual point of routing it outside the shell.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { LoginPage } from "./login-page";

const t = i18n.getFixedT(null, "auth");

describe("login page", () => {
  it("renders the login title as the single level-1 heading", () => {
    render(<LoginPage />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(t("login.title"));
  });

  it("renders the subtitle and its own main landmark", () => {
    render(<LoginPage />);

    expect(screen.getByText(t("login.subtitle"))).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders without any of the app shell's landmarks", () => {
    render(<LoginPage />);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: i18n.t("shell.skipLink") })).not.toBeInTheDocument();
  });
});
