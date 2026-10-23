import { i18n } from "@/lib/i18n";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";

import { ListPagination } from "./list-pagination";

function renderPagination(overrides: Partial<Parameters<typeof ListPagination>[0]> = {}) {
  const onPageChange = vi.fn();

  render(
    <I18nextProvider i18n={i18n}>
      <ListPagination
        page={1}
        limit={20}
        total={45}
        totalPages={3}
        onPageChange={onPageChange}
        {...overrides}
      />
    </I18nextProvider>,
  );

  return { onPageChange };
}

describe("ListPagination", () => {
  it("disables the previous control on the first page and the next on the last", () => {
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <ListPagination page={1} limit={20} total={45} totalPages={3} onPageChange={vi.fn()} />
      </I18nextProvider>,
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

    rerender(
      <I18nextProvider i18n={i18n}>
        <ListPagination page={3} limit={20} total={45} totalPages={3} onPageChange={vi.fn()} />
      </I18nextProvider>,
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("summarizes the visible range of results", () => {
    renderPagination();

    expect(screen.getByText("Showing 1 to 20 of 45")).toBeInTheDocument();
  });

  it("asks for the chosen page", async () => {
    const { onPageChange } = renderPagination({ page: 2 });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Go to page 3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("button", { name: "Go to page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("steps one page with the boundary controls", async () => {
    const { onPageChange } = renderPagination({ page: 2 });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Previous page" }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("compresses long page lists with an ellipsis marker", () => {
    renderPagination({ page: 10, totalPages: 20, total: 400 });

    expect(screen.getAllByText(/More pages/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Go to page 8" })).toBeNull();
    expect(screen.getByRole("button", { name: "Go to page 20" })).toBeInTheDocument();
  });

  it("renders a single page as its own current entry", () => {
    renderPagination({ page: 1, totalPages: 1, total: 5 });

    expect(screen.getByRole("button", { name: "Go to page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByText("Showing 1 to 5 of 5")).toBeInTheDocument();
  });
});
