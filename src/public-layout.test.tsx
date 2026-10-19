// Public layout tests (COU-310, T1 / S3, S8).
//
// The public surface is the opposite of the console shell: no product navigation, but the
// same accessibility floor — one skip link, one main landmark, a named navigation and an
// announced route change. These assertions are the contract the e2e suite repeats in a
// real browser.
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";

import { PublicLayout } from "./public-layout";

const t = i18n.getFixedT(null, "landing");
const tCommon = i18n.getFixedT(null, "common");

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route Component={PublicLayout}>
          <Route index element={<p>landing content</p>} />
          <Route path="about" element={<p>about content</p>} />
        </Route>
        <Route path="/login" element={<p>login content</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("public layout", () => {
  it("renders the landmarks and the named navigation of the public site", () => {
    renderAt("/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: t("nav.label") })).toBeInTheDocument();
  });

  it("keeps exactly one skip link, pointing at the single main landmark", () => {
    renderAt("/");

    const skipLinks = screen.getAllByRole("link", { name: tCommon("shell.skipLink") });
    expect(skipLinks).toHaveLength(1);
    expect(skipLinks[0]).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("never renders the console shell's product navigation", () => {
    renderAt("/");

    expect(screen.queryByRole("navigation", { name: tCommon("shell.navigation.main") })).toBeNull();
    expect(screen.queryByText(tCommon("shell.productLabel"))).toBeNull();
  });

  it("announces the landing and the about route", async () => {
    const { unmount } = renderAt("/");
    // The announcer delays its message so screen readers pick it up after the DOM update.
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        tCommon("shell.routeAnnouncer.loaded", { title: t("title") }),
      );
    });

    unmount();
    renderAt("/about");
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        tCommon("shell.routeAnnouncer.loaded", { title: t("about.title") }),
      );
    });
  });

  it("shows the Countergank mark next to the title in the brand link", () => {
    const { container } = renderAt("/");

    const brand = within(screen.getByRole("banner")).getByRole("link", { name: t("title") });

    // The colour artwork for the light theme, the inlined monochrome mark for the dark one:
    // the colour mark's "C" is black and would disappear on a dark background.
    const colourMark = brand.querySelector('img[src="/logo-countergank-color.png"]');
    const monochromeMark = brand.querySelector("svg");

    expect(colourMark).not.toBeNull();
    expect(colourMark).toHaveAttribute("aria-hidden", "true");
    expect(monochromeMark).not.toBeNull();
    expect(monochromeMark).toHaveAttribute("fill", "currentColor");
    expect(container).toBeTruthy();
  });

  it("offers the language switcher in the header", () => {
    renderAt("/");

    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: tCommon("shell.language.switch"),
      }),
    ).toBeInTheDocument();
  });

  it("stacks the landmarks in a full-height column so the footer sits at the page bottom", () => {
    renderAt("/about");

    // jsdom has no layout engine, so the contract is the structure: one flex column that
    // fills the viewport, with the main landmark growing and the footer after it.
    const main = screen.getByRole("main");
    const column = main.parentElement;

    expect(column).not.toBeNull();
    expect(column).toHaveClass("flex", "min-h-screen", "flex-col");
    expect(main).toHaveClass("flex-1");
    expect(screen.getByRole("contentinfo")).toHaveClass("mt-auto");
  });

  it("has no axe violations", async () => {
    const { container } = renderAt("/");

    expect(await axe(container)).toHaveNoViolations();
  });
});
