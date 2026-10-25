import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay } from "msw";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";

import { USERS_QUERY_KEY } from "./hooks/use-users";
import { UsersEditPage } from "./users-edit-page";

const USERS_URL = "https://test.invalid/admin/users";
const USER_URL = `${USERS_URL}/u1`;

const tUsers = i18n.getFixedT(null, "users");
const tCommon = i18n.getFixedT(null, "common");

const USER = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  userName: "ada",
  role: "user",
  createdAt: "2024-06-01T10:00:00.000Z",
  updatedAt: "2024-06-01T10:00:00.000Z",
  isActive: true,
  lockedUntil: null,
  failedLoginAttempts: 0,
};

let patchBody: unknown = null;
let patchCount = 0;

const server = setupServer(
  http.get(USER_URL, () => HttpResponse.json(USER)),
  http.patch(USER_URL, async ({ request }) => {
    patchCount += 1;
    patchBody = await request.json();

    return HttpResponse.json({
      ...USER,
      ...(patchBody as object),
      updatedAt: "2024-06-02T10:00:00.000Z",
    });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  toast.dismiss();
  server.resetHandlers();
  patchBody = null;
  patchCount = 0;
});

afterAll(() => {
  server.close();
  (Element.prototype as Partial<Element>).hasPointerCapture = undefined;
  (Element.prototype as Partial<Element>).setPointerCapture = undefined;
  (Element.prototype as Partial<Element>).releasePointerCapture = undefined;
  (Element.prototype as Partial<Element>).scrollIntoView = undefined;
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/app/users/u1/edit"]}>
          <Routes>
            <Route path="/app/users/:id/edit" element={<UsersEditPage />} />
            <Route path="/app/users" element={<p>users-list</p>} />
          </Routes>
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { invalidateSpy, container };
}

async function waitForPrefill() {
  const name = await screen.findByLabelText(tUsers("edit.fields.name"));
  expect(name).toHaveValue("Ada");

  return userEvent.setup();
}

describe("edit user form — prefill", () => {
  it("shows the fetched values in every field", async () => {
    renderPage();
    await waitForPrefill();

    expect(screen.getByLabelText(tUsers("edit.fields.lastName"))).toHaveValue("Lovelace");
    expect(screen.getByLabelText(tUsers("edit.fields.email"))).toHaveValue("ada@example.com");
    expect(screen.getByLabelText(tUsers("edit.fields.userName"))).toHaveValue("ada");
    expect(screen.getByRole("combobox", { name: tUsers("edit.fields.role") })).toHaveTextContent(
      "user",
    );
  });
});

describe("edit user form — dirty state", () => {
  it("keeps save disabled until something changes, and re-disables when the value returns to the original", async () => {
    renderPage();
    await waitForPrefill();
    const save = screen.getByRole("button", { name: tUsers("edit.submit") });

    expect(save).toBeDisabled();

    const user = userEvent.setup();
    const name = screen.getByLabelText(tUsers("edit.fields.name"));
    await user.clear(name);

    expect(save).toBeEnabled();

    await user.type(name, "Ada");

    expect(save).toBeDisabled();
  });

  it("keeps save disabled while the update is in flight", async () => {
    server.use(
      http.patch(USER_URL, async () => {
        await delay(100);

        return HttpResponse.json(USER);
      }),
    );
    renderPage();
    const user = await waitForPrefill();
    const save = screen.getByRole("button", { name: tUsers("edit.submit") });

    const name = screen.getByLabelText(tUsers("edit.fields.name"));
    await user.clear(name);
    await user.type(name, "Ada King");
    await user.click(save);

    expect(save).toBeDisabled();
    expect(await screen.findByText("users-list")).toBeInTheDocument();
  });
});

describe("edit user form — PATCH", () => {
  it("sends only the changed fields, raises the toast, invalidates the list and returns to it", async () => {
    const { invalidateSpy } = renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(tUsers("edit.fields.name"));
    await user.clear(name);
    await user.type(name, "Ada King");
    await user.click(screen.getByRole("combobox", { name: tUsers("edit.fields.role") }));
    await user.click(await screen.findByRole("option", { name: "admin" }));

    await user.click(screen.getByRole("button", { name: tUsers("edit.submit") }));

    expect(await screen.findByText("users-list")).toBeInTheDocument();
    expect(patchCount).toBe(1);
    expect(patchBody).toEqual({ name: "Ada King", role: "admin" });
    expect(await screen.findByText(tUsers("edit.success"))).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
  });

  it("maps UA-COM-004 onto the email field only", async () => {
    server.use(
      http.patch(USER_URL, () =>
        HttpResponse.json(
          { statusCode: 409, code: "UA-COM-004", message: "email taken" },
          { status: 409 },
        ),
      ),
    );
    renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(tUsers("edit.fields.name"));
    await user.clear(name);
    await user.type(name, "Ada King");
    await user.click(screen.getByRole("button", { name: tUsers("edit.submit") }));

    const email = screen.getByLabelText(tUsers("edit.fields.email"));
    expect(await screen.findByText(tUsers("create.errors.emailTaken"))).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(tUsers("edit.fields.userName"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("users-list")).not.toBeInTheDocument();
  });

  it("maps UA-COM-003 onto the userName field only", async () => {
    server.use(
      http.patch(USER_URL, () =>
        HttpResponse.json(
          { statusCode: 409, code: "UA-COM-003", message: "userName taken" },
          { status: 409 },
        ),
      ),
    );
    renderPage();
    const user = await waitForPrefill();

    const name = screen.getByLabelText(tUsers("edit.fields.name"));
    await user.clear(name);
    await user.type(name, "Ada King");
    await user.click(screen.getByRole("button", { name: tUsers("edit.submit") }));

    const userName = screen.getByLabelText(tUsers("edit.fields.userName"));
    expect(await screen.findByText(tUsers("create.errors.userNameTaken"))).toBeInTheDocument();
    expect(userName).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(tUsers("edit.fields.email"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("edit user form — role impact", () => {
  it("shows the impact notice only after the role changes", async () => {
    renderPage();
    await waitForPrefill();

    expect(screen.queryByText(tUsers("edit.roleImpact"))).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: tUsers("edit.fields.role") }));
    await user.click(await screen.findByRole("option", { name: "admin" }));

    expect(await screen.findByText(tUsers("edit.roleImpact"))).toBeInTheDocument();
  });
});

describe("edit user form — load failures", () => {
  it("shows an alert with retry when the prefill fetch fails, and recovers", async () => {
    server.use(http.get(USER_URL, () => HttpResponse.json({}, { status: 500 })));
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tCommon("error.genericMessage"));

    server.use(http.get(USER_URL, () => HttpResponse.json(USER)));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tCommon("error.retry") }));

    expect(await screen.findByLabelText(tUsers("edit.fields.name"))).toHaveValue("Ada");
  });
});

describe("edit user form — accessibility", () => {
  it("has no axe violations on the edit screen", async () => {
    const { container } = renderPage();
    await waitForPrefill();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps every field labelled", async () => {
    renderPage();
    await waitForPrefill();

    for (const key of ["name", "lastName", "email", "userName", "role"] as const) {
      expect(screen.getByLabelText(tUsers(`edit.fields.${key}`))).toBeInTheDocument();
    }
  });
});
