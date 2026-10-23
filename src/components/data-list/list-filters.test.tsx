import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { i18n } from "@/lib/i18n";

import { ListFilters, type ListSelectFilter } from "./list-filters";

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  (Element.prototype as Partial<Element>).hasPointerCapture = undefined;
  (Element.prototype as Partial<Element>).setPointerCapture = undefined;
  (Element.prototype as Partial<Element>).releasePointerCapture = undefined;
});

function renderFilters(overrides: Partial<Parameters<typeof ListFilters>[0]> = {}) {
  const onSearchChange = vi.fn();
  const onRoleChange = vi.fn();
  const onClear = vi.fn();

  const roleFilter: ListSelectFilter = {
    name: "role",
    label: "Role",
    value: "",
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
    onChange: onRoleChange,
  };

  const props = {
    searchValue: "",
    searchLabel: "Search users",
    onSearchChange,
    selectFilters: [roleFilter],
    clearLabel: "Clear filters",
    onClear,
    ...overrides,
  };

  render(
    <I18nextProvider i18n={i18n}>
      <ListFilters {...props} />
    </I18nextProvider>,
  );

  return { onSearchChange, onRoleChange, onClear, props };
}

describe("ListFilters", () => {
  it("renders the labeled search input and the select filters", () => {
    renderFilters();

    const search = screen.getByRole("searchbox", { name: "Search users" });
    expect(search).toBeInTheDocument();
    expect(screen.getByLabelText("Search users")).toBe(search);

    const role = screen.getByRole("combobox", { name: "Role" });
    expect(role).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBe(role);

    expect(screen.getByText("Search users").tagName).toBe("LABEL");
    expect(screen.getByText("Role").tagName).toBe("LABEL");
  });

  it("renders the clear action as an icon button with a title", () => {
    renderFilters();

    const clear = screen.getByRole("button", { name: "Clear filters" });

    expect(clear).toHaveAttribute("title", "Clear filters");
    expect(clear).toHaveTextContent("");
  });

  it("debounces the search: nothing is applied before 300 ms of quiet", async () => {
    const { onSearchChange } = renderFilters();
    const user = userEvent.setup();

    await user.type(screen.getByRole("searchbox", { name: "Search users" }), "ad");
    expect(onSearchChange).not.toHaveBeenCalled();

    await user.type(screen.getByRole("searchbox", { name: "Search users" }), "a");
    await vi.waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith("ada");
    });
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it("does not re-apply the value after the parent catches up with the controlled prop", async () => {
    const { props, onSearchChange } = renderFilters();
    const user = userEvent.setup();

    await user.type(screen.getByRole("searchbox", { name: "Search users" }), "ada");
    await vi.waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith("ada");
    });

    cleanup();
    render(
      <I18nextProvider i18n={i18n}>
        <ListFilters {...props} searchValue="ada" />
      </I18nextProvider>,
    );
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it("applies a select filter choice through its callback", async () => {
    const { onRoleChange } = renderFilters();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: "Role" }));
    await user.click(await screen.findByRole("option", { name: "Admin" }));

    expect(onRoleChange).toHaveBeenCalledWith("admin");
  });

  it("maps the all-entries choice back to an empty value", async () => {
    const onRoleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <ListFilters
          searchValue=""
          searchLabel="Search users"
          onSearchChange={vi.fn()}
          selectFilters={[
            {
              name: "role",
              label: "Role",
              value: "admin",
              options: [{ value: "admin", label: "Admin" }],
              onChange: onRoleChange,
            },
          ]}
          clearLabel="Clear filters"
          onClear={vi.fn()}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("combobox", { name: "Role" }));
    await user.click(await screen.findByRole("option", { name: "All" }));

    expect(onRoleChange).toHaveBeenCalledWith("");
  });

  it("reports the clear action", async () => {
    const { onClear } = renderFilters();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("follows the controlled applied value back into the draft", () => {
    renderFilters({ searchValue: "grace" });

    expect(screen.getByRole("searchbox", { name: "Search users" })).toHaveValue("grace");
  });
});
