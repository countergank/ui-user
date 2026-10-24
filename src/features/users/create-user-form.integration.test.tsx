import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";
import { i18n } from "@/lib/i18n";

import { CreateUserForm } from "./create-user-form";
import { USERS_QUERY_KEY } from "./hooks/use-users";

const USERS_URL = "https://test.invalid/admin/users";

const tUsers = i18n.getFixedT(null, "users");
const tCommon = i18n.getFixedT(null, "common");

const CREATED = {
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  userName: "ada",
  role: "user",
  createdAt: "2024-06-01T10:00:00.000Z",
  updatedAt: "2024-06-01T10:00:00.000Z",
  isActive: true,
};

let requestCount = 0;
let lastBody: unknown = null;

const server = setupServer(
  http.post(USERS_URL, async ({ request }) => {
    requestCount += 1;
    lastBody = await request.json();

    return HttpResponse.json(CREATED, { status: 201 });
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
  server.resetHandlers();
  requestCount = 0;
  lastBody = null;
});

afterAll(() => {
  server.close();
  (Element.prototype as Partial<Element>).hasPointerCapture = undefined;
  (Element.prototype as Partial<Element>).setPointerCapture = undefined;
  (Element.prototype as Partial<Element>).releasePointerCapture = undefined;
  (Element.prototype as Partial<Element>).scrollIntoView = undefined;
});

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");

  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/app/users/new"]}>
          <Routes>
            <Route path="/app/users/new" element={<CreateUserForm />} />
            <Route path="/app/users" element={<p>users-list</p>} />
          </Routes>
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );

  return { invalidateSpy, container };
}

async function fillForm({
  password = "Nx9!mKp2",
  confirmPassword,
  role,
}: { password?: string; confirmPassword?: string; role?: string } = {}) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(tUsers("create.fields.name")), "Ada");
  await user.type(screen.getByLabelText(tUsers("create.fields.lastName")), "Lovelace");
  await user.type(screen.getByLabelText(tUsers("create.fields.email")), "ada@example.com");
  await user.type(screen.getByLabelText(tUsers("create.fields.userName")), "ada");
  await user.type(screen.getByLabelText(tUsers("create.fields.password")), password);
  await user.type(
    screen.getByLabelText(tUsers("create.fields.confirmPassword")),
    confirmPassword ?? password,
  );

  if (role !== undefined) {
    await user.click(screen.getByRole("combobox", { name: tUsers("create.fields.role") }));
    await user.click(await screen.findByRole("option", { name: role }));
  }

  return user;
}

describe("create user form — MSW", () => {
  it("posts the payload, raises the toast, invalidates the list and returns to it", async () => {
    const { invalidateSpy } = renderForm();

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    expect(await screen.findByText("users-list")).toBeInTheDocument();
    expect(await screen.findByText(tUsers("create.success"))).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
    expect(lastBody).toEqual({
      name: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      userName: "ada",
      password: "Nx9!mKp2",
      role: "user",
    });
  });

  it("sends the role the user picked in the Select", async () => {
    renderForm();

    const user = await fillForm({ role: "admin" });
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    expect(await screen.findByText("users-list")).toBeInTheDocument();

    expect(lastBody).toMatchObject({ role: "admin" });
  });

  it("maps UA-COM-004 onto the email field only", async () => {
    server.use(
      http.post(USERS_URL, () =>
        HttpResponse.json(
          { statusCode: 409, code: "UA-COM-004", message: "email taken" },
          { status: 409 },
        ),
      ),
    );
    renderForm();

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    const email = screen.getByLabelText(tUsers("create.fields.email"));
    expect(await screen.findByText(tUsers("create.errors.emailTaken"))).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(tUsers("create.fields.userName"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("users-list")).not.toBeInTheDocument();
  });

  it("maps UA-COM-003 onto the userName field only", async () => {
    server.use(
      http.post(USERS_URL, () =>
        HttpResponse.json(
          { statusCode: 409, code: "UA-COM-003", message: "userName taken" },
          { status: 409 },
        ),
      ),
    );
    renderForm();

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    const userName = screen.getByLabelText(tUsers("create.fields.userName"));
    expect(await screen.findByText(tUsers("create.errors.userNameTaken"))).toBeInTheDocument();
    expect(userName).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(tUsers("create.fields.email"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("maps a PASSWORD_ code onto the password field only", async () => {
    server.use(
      http.post(USERS_URL, () =>
        HttpResponse.json(
          { statusCode: 422, code: "PASSWORD_TOO_WEAK", message: "weak" },
          { status: 422 },
        ),
      ),
    );
    renderForm();

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    expect(await screen.findByText(tUsers("create.errors.weakPassword"))).toBeInTheDocument();
    expect(screen.getByLabelText(tUsers("create.fields.password"))).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("blocks a weak password before any request", async () => {
    renderForm();

    const user = await fillForm({ password: "short" });
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    expect(await screen.findByText(tUsers("create.errors.weakPassword"))).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });

  it("shows a form-level alert for a failure the API does not attach to a field", async () => {
    server.use(
      http.post(USERS_URL, () =>
        HttpResponse.json(
          { statusCode: 500, code: "HTTP_ERROR", message: "boom" },
          { status: 500 },
        ),
      ),
    );
    renderForm();

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tCommon("error.genericMessage"));
    expect(screen.getByLabelText(tUsers("create.fields.email"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("blocks an empty submit with per-field errors and no request", async () => {
    renderForm();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    const messages = await screen.findAllByText(tUsers("create.errors.fieldRequired"));
    expect(messages.length).toBeGreaterThan(0);
    expect(requestCount).toBe(0);
  });

  it("returns to the list when the user cancels", async () => {
    renderForm();

    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: tUsers("create.cancel") }));

    expect(await screen.findByText("users-list")).toBeInTheDocument();
  });

  it("groups the fields under labelled sections", () => {
    renderForm();

    expect(screen.getByText(tUsers("create.groups.identity"))).toBeInTheDocument();
    expect(screen.getByText(tUsers("create.groups.access"))).toBeInTheDocument();
  });

  it("blocks a mismatched confirmation on the confirm field and does not post", async () => {
    renderForm();

    const user = await fillForm({ confirmPassword: "Different9!pass" });
    await user.click(screen.getByRole("button", { name: tUsers("create.submit") }));

    expect(await screen.findByText(tUsers("create.errors.passwordMismatch"))).toBeInTheDocument();
    expect(screen.getByLabelText(tUsers("create.fields.confirmPassword"))).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(tUsers("create.fields.password"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(requestCount).toBe(0);
    expect(screen.queryByText("users-list")).not.toBeInTheDocument();
  });

  it.each([
    ["Nx9!", "weak"],
    ["Nx9mKp2w", "medium"],
    ["Nx9!mKp2", "strong"],
  ] as const)("announces the %s strength band for %s", async (password, band) => {
    renderForm();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(tUsers("create.fields.password")), password);

    const announcement = tUsers("create.passwordStrength.label", {
      strength: tUsers(`create.passwordStrength.${band}`),
    });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(announcement);
  });

  it("has no axe violations on the form", async () => {
    const { container } = renderForm();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps every field labelled", () => {
    renderForm();

    for (const key of [
      "name",
      "lastName",
      "email",
      "userName",
      "password",
      "confirmPassword",
      "role",
    ] as const) {
      expect(screen.getByLabelText(tUsers(`create.fields.${key}`))).toBeInTheDocument();
    }
  });
});
