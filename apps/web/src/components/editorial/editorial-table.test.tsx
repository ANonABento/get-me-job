import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  EditorialTable,
  EditorialTableBody,
  EditorialTableCell,
  EditorialTableHead,
  EditorialTableHeaderCell,
  EditorialTableRow,
} from "./editorial-table";

const renderTable = (extra: Record<string, unknown> = {}) =>
  render(
    <EditorialTable ariaLabel="Recent applications">
      <EditorialTableHead>
        <tr>
          <EditorialTableHeaderCell>Role</EditorialTableHeaderCell>
          <EditorialTableHeaderCell align="right">
            Posted
          </EditorialTableHeaderCell>
        </tr>
      </EditorialTableHead>
      <EditorialTableBody>
        <EditorialTableRow {...extra}>
          <EditorialTableCell>Product Designer</EditorialTableCell>
          <EditorialTableCell mono align="right">
            May 12
          </EditorialTableCell>
        </EditorialTableRow>
      </EditorialTableBody>
    </EditorialTable>,
  );

describe("EditorialTable", () => {
  it("renders a labelled table with mono-caps thead", () => {
    renderTable();
    const table = screen.getByRole("table", { name: "Recent applications" });
    expect(table).toBeVisible();
    const head = screen.getByText("Role");
    expect(head.tagName).toBe("TH");
    expect(head.className).toMatch(/font-mono/);
    expect(head.className).toMatch(/uppercase/);
  });

  it("applies the app-shell-cell density class to body cells", () => {
    renderTable();
    const cell = screen.getByText("Product Designer");
    expect(cell.className).toMatch(/app-shell-cell/);
  });

  it("applies tabular-nums to mono cells", () => {
    renderTable();
    expect(screen.getByText("May 12").className).toMatch(/tabular-nums/);
  });

  it("respects horizontal alignment on header cells", () => {
    renderTable();
    expect(screen.getByText("Posted").className).toMatch(/text-right/);
  });

  it("invokes onClick + adds hover style when interactive", () => {
    const onClick = vi.fn();
    renderTable({ interactive: true, onClick });
    const row = screen.getByText("Product Designer").closest("tr")!;
    expect(row.className).toMatch(/hover:bg-rule-strong-bg/);
    row.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
