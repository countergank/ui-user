import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay } from "msw";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { PROFILE_QUERY_KEY } from "./hooks/use-profile";
import { ProfilePage } from "./profile-page";

const PROFILE_URL = "https://test.invalid/users/profile";

const t = i18n.getFixedT(null, "profile");
const tCommon = i18n.getFixedT(null, "common");

const PROFILE = {
  name: "Martina",
  lastName: "Cabrera",
  email: "mcabrera@countergank.com",
};

let patchBody: unknown = null;
let patchCount = 0;

const server = setupServer(
  http.get(PROFILE_URL, () => HttpResponse.json(PROFILE)),
  http.patch(PROFILE_URL, async ({ request }) => {
    patchCount += 1;
    patchBody = await request.json();

    return HttpResponse.json({ ...PROFILE, ...(patchBody as object) });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: PROFILE.email,
      userName: "mcabrera",
      name: PROFILE.name,
      lastName: PROFILE.lastName,
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
});

afterEach(() => {
  toast.dismiss();
  server.resetHandlers();
  patchBody = null;
  patchCount = 0;
  sessionStore.setState(initialSessionState);
});

afterAll(() => {
  server.close();
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/profile"]}>
          <ProfilePage />
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { invalidateSpy, container };
}

async function waitForPrefill() {
  const name = await screen.findByLabelText(t("fields.name"));
  expect(name).toHaveValue("Martina");

  return userEvent.setup();
}

describe("profile page — prefill", () => {
  it("renders the page header and the card title", async () => {
    renderPage();
    await waitForPrefill();

    expect(screen.getByRole("heading", { level: 1, name: t("view.heading") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: t("view.title") })).toBeInTheDocument();
  });

  it("shows a loading status while the profile is in flight", async () => {
    server.use(
      http.get(PROFILE_URL, async () => {
        await delay(50);

        return HttpResponse.json(PROFILE);
      }),
    );
    renderPage();

    expect(screen.getByText(t("view.loading"))).toBeInTheDocument();

    expect(await screen.findByLabelText(t("fields.name"))).toHaveValue("Martina");
  });

  it("shows the fetched values in every field", async () => {
    renderPage();
    await waitForPrefill();

    expect(screen.getByLabelText(t("fields.lastName"))).toHaveValue("Cabrera");
    expect(screen.getByLabelText(t("fields.email"))).toHaveValue("mcabrera@countergank.com");
  });

  it("shows an alert with retry when the prefill fetch fails, and recovers", async () => {
    server.use(http.get(PROFILE_URL, () => HttpResponse.json({}, { status: 500 })));
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tCommon("error.genericMessage"));

    server.use(http.get(PROFILE_URL, () => HttpResponse.json(PROFILE)));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tCommon("error.retry") }));

    expect(await screen.findByLabelText(t("fields.name"))).toHaveValue("Martina");
  });
});

describe("profile page — dirty state", () => {
  it("keeps save disabled until something changes, and re-disables when the value returns to the original", async () => {
    renderPage();
    const user = await waitForPrefill();
    const save = screen.getByRole("button", { name: t("actions.save") });

    expect(save).toBeDisabled();

    const name = screen.getByLabelText(t("fields.name"));
    await user.clear(name);

    expect(save).toBeEnabled();

    await user.type(name, "Martina");

    expect(save).toBeDisabled();
  });

  it("resets the edited values back to the loaded ones on cancel", async () => {
    renderPage();
    const user = await waitForPrefill();

    const lastName = screen.getByLabelText(t("fields.lastName"));
    await user.clear(lastName);
    await user.type(lastName, "González");
    await user.click(screen.getByRole("button", { name: t("actions.cancel") }));

    await waitFor(() => {
      expect(screen.getByLabelText(t("fields.lastName"))).toHaveValue("Cabrera");
    });
    expect(patchCount).toBe(0);
  });
});

describe("profile page — PATCH", () => {
  it("sends only the changed fields, raises the success toast and updates the session user", async () => {
    renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(t("fields.name"));
    await user.clear(name);
    await user.type(name, "Martina José");
    await user.click(screen.getByRole("button", { name: t("actions.save") }));

    expect(await screen.findByText(t("success.updated"))).toBeInTheDocument();
    expect(patchCount).toBe(1);
    expect(patchBody).toEqual({ name: "Martina José" });
    expect(sessionStore.getState().user?.name).toBe("Martina José");
    expect(sessionStore.getState().user?.lastName).toBe("Cabrera");
    expect(sessionStore.getState().accessToken).toBe("access-1");
  });

  it("invalidates the profile cache after saving", async () => {
    const { invalidateSpy } = renderPage();
    const user = await waitForPrefill();

    const lastName = screen.getByLabelText(t("fields.lastName"));
    await user.clear(lastName);
    await user.type(lastName, "Cabrera Pérez");
    await user.click(screen.getByRole("button", { name: t("actions.save") }));

    expect(await screen.findByText(t("success.updated"))).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: PROFILE_QUERY_KEY });
  });

  it("shows the echoed values after a successful save", async () => {
    server.use(
      http.patch(PROFILE_URL, () =>
        HttpResponse.json({ ...PROFILE, name: "Marina", lastName: "Cabral" }),
      ),
    );
    renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(t("fields.name"));
    await user.clear(name);
    await user.type(name, "Marina");
    await user.click(screen.getByRole("button", { name: t("actions.save") }));

    expect(await screen.findByLabelText(t("fields.name"))).toHaveValue("Marina");
    expect(screen.getByLabelText(t("fields.lastName"))).toHaveValue("Cabral");
  });

  it("sends nothing when the only change is whitespace the schema trims away", async () => {
    renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(t("fields.name"));
    await user.clear(name);
    await user.type(name, "  Martina  ");
    await user.click(screen.getByRole("button", { name: t("actions.save") }));

    await waitFor(() => {
      expect(patchCount).toBe(0);
    });
    expect(screen.queryByText(t("success.updated"))).toBeNull();
  });

  it("keeps save disabled while the update is in flight", async () => {
    server.use(
      http.patch(PROFILE_URL, async () => {
        await delay(100);

        return HttpResponse.json(PROFILE);
      }),
    );
    renderPage();
    const user = await waitForPrefill();
    const save = screen.getByRole("button", { name: t("actions.save") });

    const name = screen.getByLabelText(t("fields.name"));
    await user.clear(name);
    await user.type(name, "Martina José");
    await user.click(save);

    expect(save).toBeDisabled();
    expect(await screen.findByText(t("success.updated"))).toBeInTheDocument();
  });
});

describe("profile page — save errors", () => {
  it("shows the failure toast and a form alert with the catalog copy, never the backend message", async () => {
    server.use(
      http.patch(PROFILE_URL, () =>
        HttpResponse.json(
          { statusCode: 500, message: "database exploded at 2026-02-14" },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(t("fields.name"));
    await user.clear(name);
    await user.type(name, "Martina José");
    await user.click(screen.getByRole("button", { name: t("actions.save") }));

    expect(await screen.findByText(t("errors.saveFailure"))).toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(tCommon("error.family.server"));
    expect(alert).not.toHaveTextContent("database exploded");
    expect(sessionStore.getState().user?.name).toBe("Martina");
  });
});

describe("profile page — read-only email (S10)", () => {
  it("renders the email as a read-only disabled field with the read-only pill", async () => {
    renderPage();
    await waitForPrefill();

    const email = screen.getByLabelText(t("fields.email"));
    expect(email).toHaveAttribute("readonly");
    expect(email).toBeDisabled();
    expect(screen.getByText(t("fields.readOnly"))).toBeInTheDocument();
  });
});

describe("profile page — avatar (S15)", () => {
  it("shows the session initials with the edit-photo button pending its backend endpoint", async () => {
    const { container } = renderPage();
    await waitForPrefill();

    expect(screen.getByText("MC")).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: t("actions.changePhoto") });
    expect(editButton).toBeInTheDocument();

    const avatar = container.querySelector('[data-testid="profile-avatar"]');
    expect(avatar?.contains(editButton)).toBe(true);
  });
});

describe("profile page — accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = renderPage();
    await waitForPrefill();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps every editable field labelled", async () => {
    renderPage();
    await waitForPrefill();

    expect(screen.getByLabelText(t("fields.name"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("fields.lastName"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("fields.email"))).toBeInTheDocument();

    const name = screen.getByText(t("fields.name"));
    expect(name).toHaveAttribute("for", screen.getByLabelText(t("fields.name")).id);
  });
});
