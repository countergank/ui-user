import { render, screen } from "@testing-library/react";
// Integration tests for the route error boundary (ARCH-4, react-router v7
// errorElement pattern): HTTP error responses, domain errors, and raw errors.
// Boundary copy assertions are derived from the i18n resources (COU-253);
// statusText and thrown messages remain server/error-owned content.
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { DataFetchError } from "@/lib/errors";
import { RouteErrorBoundary } from "./route-error-boundary";

function renderWithLoader(loader: () => unknown) {
  const router = createMemoryRouter([
    {
      path: "/",
      Component: () => <h1>Should not render</h1>,
      errorElement: <RouteErrorBoundary />,
      loader,
    },
  ]);
  render(<RouterProvider router={router} />);
}

describe("RouteErrorBoundary", () => {
  it("renders an HTTP status error for a 404 response", async () => {
    renderWithLoader(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router loaders signal HTTP errors by throwing a Response (isRouteErrorResponse contract).
      throw new Response("Not found", { status: 404, statusText: "Not Found" });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.statusTitle", { status: "404" }));
    expect(alert).toHaveTextContent("Not Found");
  });

  it("renders the DataFetchError title and message", async () => {
    renderWithLoader(() => {
      throw new DataFetchError("Network boom", { status: 503 });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.dataFetchTitle"));
    expect(alert).toHaveTextContent("Network boom");
  });

  it("normalizes a raw thrown error into the generic title", async () => {
    renderWithLoader(() => {
      throw new Error("unexpected");
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.genericTitle"));
    expect(alert).toHaveTextContent("unexpected");
  });
});
