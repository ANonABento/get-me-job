import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkActionBar } from "./bulk-action-bar";

const defaultProps = {
  selectedCount: 3,
  totalCount: 10,
  onSelectAll: vi.fn(),
  onDeselectAll: vi.fn(),
  onDelete: vi.fn(),
  onAddToResume: vi.fn(),
  onExport: vi.fn(),
};

describe("BulkActionBar", () => {
  it("should render nothing when no items selected", () => {
    const { container } = render(
      <BulkActionBar {...defaultProps} selectedCount={0} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("should show selected count", () => {
    const { container } = render(<BulkActionBar {...defaultProps} />);
    expect(screen.getByText("3 selected")).toBeInTheDocument();
    expect(container.firstElementChild?.className).toContain(
      "rounded-[var(--radius)]",
    );
    expect(container.firstElementChild?.className).toContain(
      "shadow-[var(--shadow-card)]",
    );
  });

  it("should show Select All when not all selected", () => {
    render(<BulkActionBar {...defaultProps} />);
    expect(screen.getByText("Select All")).toBeInTheDocument();
  });

  it("should show Deselect All when all selected", () => {
    render(
      <BulkActionBar {...defaultProps} selectedCount={10} totalCount={10} />,
    );
    expect(screen.getByText("Deselect All")).toBeInTheDocument();
  });

  it("should call onSelectAll when Select All is clicked", () => {
    const onSelectAll = vi.fn();
    render(<BulkActionBar {...defaultProps} onSelectAll={onSelectAll} />);
    fireEvent.click(screen.getByText("Select All"));
    expect(onSelectAll).toHaveBeenCalled();
  });

  it("should call onDeselectAll when Deselect All is clicked", () => {
    const onDeselectAll = vi.fn();
    render(
      <BulkActionBar
        {...defaultProps}
        selectedCount={10}
        totalCount={10}
        onDeselectAll={onDeselectAll}
      />,
    );
    fireEvent.click(screen.getByText("Deselect All"));
    expect(onDeselectAll).toHaveBeenCalled();
  });

  it("should call onDelete when Delete is clicked", () => {
    const onDelete = vi.fn();
    render(<BulkActionBar {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("should call onAddToResume when Add to Resume is clicked", () => {
    const onAddToResume = vi.fn();
    render(<BulkActionBar {...defaultProps} onAddToResume={onAddToResume} />);
    fireEvent.click(screen.getByText("Add to Resume"));
    expect(onAddToResume).toHaveBeenCalled();
  });

  it("should call onExport when Export is clicked", () => {
    const onExport = vi.fn();
    render(<BulkActionBar {...defaultProps} onExport={onExport} />);
    fireEvent.click(screen.getByText("Export"));
    expect(onExport).toHaveBeenCalled();
  });
});
