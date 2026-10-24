import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";

import { i18n } from "@/lib/i18n";

import { DataTable, type DataTableColumn } from "./data-table";

function renderWithI18n(ui: React.ReactElement, instance: I18nInstance = i18n) {
  return render(<I18nextProvider i18n={instance}>{ui}</I18nextProvider>);
}

interface Row {
  id: string;
  name: string;
  price: string;
}

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name },
  { key: "price", header: "Price", cell: (row) => row.price, align: "right" },
];

const ROWS: Row[] = [
  { id: "r1", name: "Ada", price: "1" },
  { id: "r2", name: "Grace", price: "2" },
];

describe("DataTable", () => {
  it("renders column headers and one row per item, with accessible table semantics", () => {
    renderWithI18n(
      <DataTable columns={COLUMNS} rows={ROWS} rowKey={(row) => row.id} caption="Users" />,
    );

    expect(screen.getByRole("table", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Price" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "Ada" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Grace" })).toBeInTheDocument();
  });

  it("shows skeleton rows and no data while loading", () => {
    renderWithI18n(
      <DataTable columns={COLUMNS} rows={[]} rowKey={(row) => row.id} isLoading skeletonRows={4} />,
    );

    expect(screen.queryByRole("cell", { name: "Ada" })).not.toBeInTheDocument();
    expect(document.querySelectorAll("tbody tr")).toHaveLength(4);
  });

  it("renders the empty slot when there are no rows and loading is done", () => {
    renderWithI18n(
      <DataTable
        columns={COLUMNS}
        rows={[]}
        rowKey={(row) => row.id}
        empty={<p>No users found</p>}
      />,
    );

    expect(screen.getByText("No users found")).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Ada" })).not.toBeInTheDocument();
  });

  it("falls back to the generic empty copy when the caller passes no slot", () => {
    renderWithI18n(<DataTable columns={COLUMNS} rows={[]} rowKey={(row) => row.id} />);

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders sortable headers as buttons and reports the sort request", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();

    renderWithI18n(
      <DataTable
        columns={[{ ...COLUMNS[0], sortKey: "name" }, COLUMNS[1]]}
        rows={ROWS}
        rowKey={(row) => row.id}
        sortBy="name"
        sortOrder="asc"
        onSort={onSort}
      />,
    );

    const nameHeader = screen.getByRole("columnheader", { name: "Name" });
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Price" })).not.toHaveAttribute("aria-sort");

    await user.click(screen.getByRole("button", { name: "Sort by Name" }));

    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("aligns a right-aligned column to the right", () => {
    renderWithI18n(<DataTable columns={COLUMNS} rows={ROWS} rowKey={(row) => row.id} />);

    expect(screen.getByRole("cell", { name: "1" })).toHaveClass("text-right");
  });
});
