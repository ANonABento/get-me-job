import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JobsToolbar } from "./jobs-toolbar";

const defaultProps = {
  searchQuery: "",
  statusFilter: "all" as const,
  typeFilter: "all" as const,
  remoteFilter: "all" as const,
  sortBy: "newest" as const,
  hasActiveFilters: false,
  filteredCount: 0,
  totalCount: 0,
  onSearchChange: vi.fn(),
  onStatusChange: vi.fn(),
  onTypeChange: vi.fn(),
  onRemoteChange: vi.fn(),
  onSortChange: vi.fn(),
  onClearFilters: vi.fn(),
};

describe("JobsToolbar", () => {
  it("uses a 44px search clear touch target", () => {
    render(<JobsToolbar {...defaultProps} searchQuery="frontend" />);

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    expect(clearButton.className).toContain("h-11");
    expect(clearButton.className).toContain("w-11");
    expect(screen.getByPlaceholderText(/search jobs/i).className).toContain(
      "pr-12",
    );
  });
});
