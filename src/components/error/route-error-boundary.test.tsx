import { render, screen } from "@testing-library/react";
// Route error boundary (ARCH-4): HTTP responses, domain errors, raw errors and the 403 exits
// (COU-274/COU-323). Copy comes from the i18n resources (COU-253).
import { RouterProvider, createMemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { DataFetchError } from "@/lib/errors";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";
import { RouteErrorBoundary } from "./route-error-boundary";

function LoginProbe() {
  const location = useLocation();

  return <p data-testid="login-location">{`${location.pathname}${location.search}`}</p>;
}

function renderWithLoader(loader: () => unknown, initialPath = "/") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        Component: () => <h1>Should not render</h1>,
        errorElement: <RouteErrorBoundary />,
        loader,
      },
      // COU-274: a server 403 navigates here instead of rendering the view in place.
      { path: "/forbidden", Component: () => <h1>Forbidden page</h1> },
      { path: "/login", Component: LoginProbe },
      {
        path: "/guard/:id",
        Component: () => <h1>Guard page</h1>,
        errorElement: <RouteErrorBoundary />,
        loader,
      },
    ],
    { initialEntries: [initialPath] },
  );

  render(<RouterProvider router={router} />);
}

function startSession() {
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: "ada@example.com",
      userName: "ada",
      name: "Ada",
      lastName: "Lovelace",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
}

beforeEach(() => {
  sessionStore.setState(initialSessionState);
});

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

  it("sends an authenticated 403 to the forbidden page (COU-275, S6 / COU-274, S3)", async () => {
    startSession();
    renderWithLoader(() => {
      throw new DataFetchError("Request failed with status 403", {
        status: 403,
        code: "UA-SEC-002",
      });
    });

    // The generic error copy must never absorb a denial, and neither must the raw message.
    expect(await screen.findByRole("heading", { name: "Forbidden page" })).toBeInTheDocument();
    expect(screen.queryByText("Request failed with status 403")).toBeNull();
    expect(screen.queryByText(i18n.t("error.genericTitle"))).toBeNull();
  });

  it("keeps the destination when a 403 arrives without a session (COU-323)", async () => {
    // `/forbidden` sits behind RequireAuth, so navigating there anonymously would replace
    // the origin with `/forbidden` and drop where the person actually was.
    renderWithLoader(() => {
      throw new DataFetchError("Request failed with status 403", {
        status: 403,
        code: "UA-SEC-002",
      });
    }, "/guard/42");

    expect(await screen.findByTestId("login-location")).toHaveTextContent(
      "/login?redirect=%2Fguard%2F42",
    );
    expect(screen.queryByRole("heading", { name: "Forbidden page" })).toBeNull();
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
