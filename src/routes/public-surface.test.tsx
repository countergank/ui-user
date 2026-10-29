import { render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "@/lib/i18n";

import { router } from "./index";

const tLanding = i18n.getFixedT(null, "landing");
const fetchSpy = vi.fn();

beforeEach(() => {
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("public surface", () => {
  it("renders the landing and the about page without a single request", async () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ["/"] });

    render(<RouterProvider router={memoryRouter} />);

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      tLanding("hero.headline"),
    );

    await memoryRouter.navigate("/about");
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tLanding("about.title"));
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
