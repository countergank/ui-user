import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { AppError, DataFetchError } from "@/lib/errors";
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

  it("renders the DataFetchError title and the catalog copy instead of the backend message", async () => {
    renderWithLoader(() => {
      throw new DataFetchError("Network boom", { status: 503 });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.dataFetchTitle"));
    expect(alert).toHaveTextContent(i18n.t("error.family.server"));
    expect(screen.queryByText("Network boom")).toBeNull();
  });

  it("renders the UA catalog copy and a copyable traceId for a known code", async () => {
    renderWithLoader(() => {
      throw new AppError("jwt expired: signature verification failed", {
        code: "UA-AUTH-002",
        status: 401,
        traceId: "trace-42",
      });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.ua.UA-AUTH-002"));
    expect(screen.getByText("trace-42")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: i18n.t("error.traceId.copy") })).toBeInTheDocument();
  });

  it("renders the family fallback and the traceId for an unknown code", async () => {
    renderWithLoader(() => {
      throw new AppError("codigo raro del backend", {
        code: "UA-XXX-999",
        status: 400,
        traceId: "trace-9",
      });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.family.request"));
    expect(screen.queryByText("codigo raro del backend")).toBeNull();
    expect(screen.getByText("trace-9")).toBeInTheDocument();
  });

  it("sends an authenticated 403 to the forbidden page (COU-275, S6 / COU-274, S3)", async () => {
    startSession();
    renderWithLoader(() => {
      throw new DataFetchError("Request failed with status 403", {
        status: 403,
        code: "UA-SEC-002",
      });
    });

    expect(await screen.findByRole("heading", { name: "Forbidden page" })).toBeInTheDocument();
    expect(screen.queryByText("Request failed with status 403")).toBeNull();
    expect(screen.queryByText(i18n.t("error.genericTitle"))).toBeNull();
  });

  it("keeps the destination when a 403 arrives without a session (COU-323)", async () => {
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

  it("keeps the reload retry for page-level failures", async () => {
    renderWithLoader(() => {
      throw new AppError("boom", { code: "UA-COM-001", status: 500, traceId: "trace-1" });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.ua.UA-COM-001"));
    expect(screen.getByRole("button", { name: i18n.t("error.retry") })).toBeInTheDocument();
  });

  it("omits the reload retry for form-level failures", async () => {
    renderWithLoader(() => {
      throw new AppError("boom", { code: "UA-COM-004", status: 409 });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.ua.UA-COM-004"));
    expect(screen.queryByRole("button", { name: i18n.t("error.retry") })).not.toBeInTheDocument();
  });

  it("normalizes a raw thrown error into generic copy without exposing its message", async () => {
    renderWithLoader(() => {
      throw new Error("unexpected");
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.genericTitle"));
    expect(alert).toHaveTextContent(i18n.t("error.genericMessage"));
    expect(screen.queryByText("unexpected")).toBeNull();
  });
});
