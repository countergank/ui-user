// Component tests for the shadcn/ui Table primitives (COU-271, S3-S5).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

function renderTable() {
  return render(
    <Table>
      <TableCaption>Workspace members</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>user@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

describe("Table", () => {
  it("exposes a table named by its caption, with column headers and cells", () => {
    renderTable();

    expect(screen.getByRole("table", { name: "Workspace members" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "user@example.com" })).toBeInTheDocument();
  });

  it("scopes every header cell to its column", () => {
    renderTable();

    for (const header of screen.getAllByRole("columnheader")) {
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("groups header and body rows so the table reports one body row", () => {
    renderTable();

    expect(screen.getAllByRole("rowgroup")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("renders no inline styles on the elements it authors (S4)", () => {
    const { container } = renderTable();

    expectNoAuthoredInlineStyles(container);
  });

  it("has no axe violations", async () => {
    const { container } = renderTable();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
