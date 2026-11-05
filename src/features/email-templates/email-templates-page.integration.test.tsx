import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Toaster } from "@/components/ui/sonner";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { EmailTemplatesPage } from "./email-templates-page";

const TEMPLATES_URL = "https://test.invalid/email/templates";

const t = i18n.getFixedT(null, "email");

const TEMPLATES = [
  {
    name: "Password reset",
    slug: "password-reset",
    subject: "Hola {{userName}}",
    content: "Link: {{resetLink}}",
    variables: ["userName", "resetLink"],
    isActive: true,
    version: 2,
    createdAt: "2024-05-01T10:00:00.000Z",
    updatedAt: "2024-05-02T10:00:00.000Z",
  },
  {
    name: "Welcome",
    slug: "welcome",
    subject: "Welcome",
    content: "Hello!",
    variables: [],
    isActive: false,
    version: 1,
    createdAt: "2024-05-03T10:00:00.000Z",
    updatedAt: "2024-05-03T10:00:00.000Z",
  },
];

const PAGE = { data: TEMPLATES, total: 2, page: 1, limit: 20, totalPages: 1 };

const ADMIN_PROFILE = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  role: "admin",
  permissions: ["*"],
};

let lastUrl: URL | null = null;

const server = setupServer(
  http.get(TEMPLATES_URL, ({ request }) => {
    lastUrl = new URL(request.url);

    return HttpResponse.json(PAGE);
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
  lastUrl = null;
});

afterAll(() => {
  server.close();
  (Element.prototype as Partial<Element>).hasPointerCapture = undefined;
  (Element.prototype as Partial<Element>).setPointerCapture = undefined;
  (Element.prototype as Partial<Element>).releasePointerCapture = undefined;
  (Element.prototype as Partial<Element>).scrollIntoView = undefined;
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
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
});

function RouteProbe() {
  const { search } = useLocation();

  return <p data-testid="route-search">{search}</p>;
}

function renderPage(entry = "/app/settings/email-templates", permissions: string[] = ["*"]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(permissionsQueryKey, { ...ADMIN_PROFILE, permissions });

  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[entry]}>
          <EmailTemplatesPage />
          <RouteProbe />
          <Toaster />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

async function expectRows() {
  expect(await screen.findByText("Password reset")).toBeInTheDocument();
  expect(screen.getByText("welcome")).toBeInTheDocument();
}

function rowOf(text: string): HTMLElement {
  const row = screen.getByText(text).closest("tr");
  if (row === null) {
    throw new Error(`missing table row for ${text}`);
  }

  return row;
}

describe("email templates page — MSW", () => {
  it("renders the rows and always sends pagination (S1, S10)", async () => {
    renderPage();
    await expectRows();

    expect(lastUrl?.searchParams.get("page")).toBe("1");
    expect(lastUrl?.searchParams.get("limit")).toBe("20");
    expect(lastUrl?.searchParams.get("active")).toBeNull();
  });

  it("reflects the tri-state active filter through the URL and the request (S1)", async () => {
    renderPage("/app/settings/email-templates?active=false");
    await expectRows();

    expect(lastUrl?.searchParams.get("active")).toBe("false");

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: t("templates.filters.status") }));
    await user.click(await screen.findByRole("option", { name: t("templates.filters.all") }));

    await waitFor(() => {
      expect(screen.getByTestId("route-search").textContent).not.toContain("active=");
    });
    await waitFor(() => {
      expect(lastUrl?.searchParams.get("active")).toBeNull();
    });
  });

  it("shows the empty state with its CTA (S9)", async () => {
    server.use(
      http.get(TEMPLATES_URL, () =>
        HttpResponse.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      ),
    );

    renderPage();

    expect(await screen.findByText(t("templates.empty"))).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: t("templates.actions.create") })).toHaveLength(2);
    expect(screen.queryByText("Password reset")).not.toBeInTheDocument();
  });

  it("shows the error state and recovers with retry (S10)", async () => {
    server.use(http.get(TEMPLATES_URL, () => HttpResponse.json({}, { status: 500 })));

    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load data");
    expect(screen.queryByText("Password reset")).not.toBeInTheDocument();

    server.use(http.get(TEMPLATES_URL, () => HttpResponse.json(PAGE)));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await expectRows();
  });

  it("hides every action from an email:read-only session (S15)", async () => {
    renderPage("/app/settings/email-templates", ["email:read"]);
    await expectRows();

    expect(screen.queryByRole("button", { name: t("templates.actions.create") })).toBeNull();
    expect(screen.queryByRole("button", { name: t("templates.actions.edit") })).toBeNull();
    expect(screen.queryByRole("button", { name: t("templates.actions.delete") })).toBeNull();
    expect(screen.queryByRole("button", { name: t("templates.actions.test") })).toBeNull();
    expect(screen.getAllByRole("button", { name: t("templates.actions.preview") })).toHaveLength(2);
  });

  it("shows the row actions the wildcard grant authorizes (S10, S15)", async () => {
    renderPage();
    await expectRows();

    expect(screen.getByRole("button", { name: t("templates.actions.create") })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: t("templates.actions.preview") })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: t("templates.actions.test") })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: t("templates.actions.edit") })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: t("templates.actions.delete") })).toHaveLength(2);
  });

  it("creates a template through the editor dialog (S3, S11)", async () => {
    let created: Record<string, unknown> | null = null;
    server.use(
      http.post(TEMPLATES_URL, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({
          ...created,
          version: 1,
          createdAt: "2024-05-04T10:00:00.000Z",
          updatedAt: "2024-05-04T10:00:00.000Z",
        });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: t("templates.actions.create") }));

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(t("templates.editor.name")), "Invoice ready");
    await user.type(within(dialog).getByLabelText(t("templates.editor.slug")), "invoice-ready");
    await user.type(
      within(dialog).getByLabelText(t("templates.editor.subject").toUpperCase()),
      "Invoice",
    );
    await user.type(within(dialog).getByLabelText(t("templates.editor.body")), "See attachment");
    await user.type(within(dialog).getByPlaceholderText("userName"), "invoiceId");
    await user.click(
      within(dialog).getByRole("button", { name: t("templates.editor.addVariable") }),
    );

    expect(within(dialog).getByText("invoiceId")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: t("templates.editor.save") }));

    expect(await screen.findByText(t("templates.success"))).toBeInTheDocument();
    await waitFor(() => {
      expect(created).toMatchObject({
        name: "Invoice ready",
        slug: "invoice-ready",
        subject: "Invoice",
        content: "See attachment",
        variables: ["invoiceId"],
        isActive: true,
      });
    });
  });

  it("edits a template and keeps the slug read-only (S3, S6)", async () => {
    let patched: Record<string, unknown> | null = null;
    server.use(
      http.patch(`${TEMPLATES_URL}/welcome`, async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ ...TEMPLATES[1], ...patched, version: 2 });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    const row = rowOf("welcome");
    await user.click(within(row).getByRole("button", { name: t("templates.actions.edit") }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText(t("templates.editor.slug"))).toBeDisabled();
    expect(within(dialog).getByLabelText(t("templates.editor.subject").toUpperCase())).toHaveValue(
      "Welcome",
    );
    expect(within(dialog).getByText(t("templates.editor.variablesEmpty"))).toBeInTheDocument();

    const subject = within(dialog).getByLabelText(t("templates.editor.subject").toUpperCase());
    await user.clear(subject);
    await user.type(subject, "Welcome aboard");
    await user.click(within(dialog).getByRole("button", { name: t("templates.editor.save") }));

    expect(await screen.findByText(t("templates.success"))).toBeInTheDocument();
    await waitFor(() => {
      expect(patched).toMatchObject({ subject: "Welcome aboard" });
    });
  });

  it("previews a template with sample data in a sheet (S4, S7, S12)", async () => {
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    const row = rowOf("Password reset");
    await user.click(within(row).getByRole("button", { name: t("templates.actions.preview") }));

    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveTextContent(t("templates.preview.sampleNote"));
    expect(within(sheet).getByText("Hola sample")).toBeInTheDocument();
    expect(within(sheet).getByText("Link: sample")).toBeInTheDocument();
    expect(within(sheet).getByText("userName")).toBeInTheDocument();
    expect(within(sheet).getByText("resetLink")).toBeInTheDocument();
  });

  it("sends a test email with sample variables and clear feedback (S4, S14)", async () => {
    let sent: Record<string, unknown> | null = null;
    server.use(
      http.post("https://test.invalid/email/send", async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ status: "sent" });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    const row = rowOf("Password reset");
    await user.click(within(row).getByRole("button", { name: t("templates.actions.test") }));

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(t("templates.test.to")), "qa@example.com");
    await user.click(within(dialog).getByRole("button", { name: t("templates.test.send") }));

    expect(
      await screen.findByText(t("templates.test.success", { to: "qa@example.com" })),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(sent).toMatchObject({
        useCase: "password-reset",
        to: "qa@example.com",
        variables: { userName: "sample", resetLink: "sample" },
      });
    });
  });

  it("rejects the test send without a recipient and keeps the dialog open (S14)", async () => {
    let sendCount = 0;
    server.use(
      http.post("https://test.invalid/email/send", () => {
        sendCount += 1;

        return HttpResponse.json({ status: "sent" });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    const row = rowOf("Password reset");
    await user.click(within(row).getByRole("button", { name: t("templates.actions.test") }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("templates.test.send") }));

    expect(await screen.findByText(t("templates.errors.fieldRequired"))).toBeInTheDocument();
    expect(sendCount).toBe(0);
  });

  it("deletes a template through the confirmation dialog handling the empty 204 (S8, S13)", async () => {
    let deleteCount = 0;
    server.use(
      http.delete(`${TEMPLATES_URL}/welcome`, () => {
        deleteCount += 1;

        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    const row = rowOf("welcome");
    await user.click(within(row).getByRole("button", { name: t("templates.actions.delete") }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent(t("templates.delete.title"));
    expect(
      within(dialog).getByRole("button", { name: t("templates.delete.confirm") }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: t("templates.delete.confirm") }));

    expect(await screen.findByText(t("templates.deleteSuccess"))).toBeInTheDocument();
    expect(deleteCount).toBe(1);
  });

  it("keeps the delete dialog open when the endpoint fails (S13)", async () => {
    server.use(
      http.delete(`${TEMPLATES_URL}/welcome`, () => HttpResponse.json({}, { status: 500 })),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    const row = rowOf("welcome");
    await user.click(within(row).getByRole("button", { name: t("templates.actions.delete") }));

    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: t("templates.delete.confirm") }));

    expect(
      await screen.findByText(i18n.getFixedT(null, "common")("error.genericMessage")),
    ).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("paginates from the footer through the URL", async () => {
    server.use(
      http.get(TEMPLATES_URL, ({ request }) => {
        lastUrl = new URL(request.url);

        return HttpResponse.json({ ...PAGE, totalPages: 3, total: 60 });
      }),
    );
    renderPage();
    await expectRows();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(screen.getByTestId("route-search")).toHaveTextContent("page=2");
    });
  });

  it("has no axe violations on the loaded page (S16)", async () => {
    const { container } = renderPage();
    await expectRows();

    expect(await axe(container)).toHaveNoViolations();
  });
});
