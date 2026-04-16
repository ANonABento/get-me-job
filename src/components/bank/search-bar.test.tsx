import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar, CATEGORY_LABELS } from "./search-bar";

const defaultProps = {
  query: "",
  onQueryChange: vi.fn(),
  activeCategory: "all" as const,
  onCategoryChange: vi.fn(),
  sortBy: "date" as const,
  onSortChange: vi.fn(),
  counts: { experience: 5, skill: 3, project: 2, education: 1, achievement: 0, certification: 1 },
};

describe("SearchBar", () => {
  it("should render search input", () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search your knowledge bank...")).toBeInTheDocument();
  });

  it("should render All chip with total count", () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByText("All (12)")).toBeInTheDocument();
  });

  it("should render category chips with counts", () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByText("Experience (5)")).toBeInTheDocument();
    expect(screen.getByText("Skills (3)")).toBeInTheDocument();
    expect(screen.getByText("Projects (2)")).toBeInTheDocument();
    expect(screen.getByText("Education (1)")).toBeInTheDocument();
    expect(screen.getByText("Achievements (0)")).toBeInTheDocument();
    expect(screen.getByText("Certifications (1)")).toBeInTheDocument();
  });

  it("should call onQueryChange when typing", () => {
    const onQueryChange = vi.fn();
    render(<SearchBar {...defaultProps} onQueryChange={onQueryChange} />);
    fireEvent.change(screen.getByPlaceholderText("Search your knowledge bank..."), {
      target: { value: "react" },
    });
    expect(onQueryChange).toHaveBeenCalledWith("react");
  });

  it("should call onCategoryChange when clicking a chip", () => {
    const onCategoryChange = vi.fn();
    render(<SearchBar {...defaultProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByText("Experience (5)"));
    expect(onCategoryChange).toHaveBeenCalledWith("experience");
  });

  it("should call onCategoryChange with 'all' when clicking All chip", () => {
    const onCategoryChange = vi.fn();
    render(<SearchBar {...defaultProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByText("All (12)"));
    expect(onCategoryChange).toHaveBeenCalledWith("all");
  });

  it("should show clear button when query is non-empty", () => {
    render(<SearchBar {...defaultProps} query="test" />);
    // The X button should be present
    const clearButton = screen.getByPlaceholderText("Search your knowledge bank...")
      .parentElement?.querySelector("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("should call onQueryChange with empty string when clear is clicked", () => {
    const onQueryChange = vi.fn();
    render(<SearchBar {...defaultProps} query="test" onQueryChange={onQueryChange} />);
    const clearButton = screen.getByPlaceholderText("Search your knowledge bank...")
      .parentElement?.querySelector("button");
    fireEvent.click(clearButton!);
    expect(onQueryChange).toHaveBeenCalledWith("");
  });

  it("should have aria-label on clear search button", () => {
    render(<SearchBar {...defaultProps} query="test" />);
    const clearButton = screen.getByRole("button", { name: "Clear search" });
    expect(clearButton).toBeInTheDocument();
  });

  it("should have aria-label on sort select", () => {
    render(<SearchBar {...defaultProps} />);
    const sortSelect = screen.getByRole("combobox", { name: "Sort order" });
    expect(sortSelect).toBeInTheDocument();
  });

  it("should export CATEGORY_LABELS", () => {
    expect(CATEGORY_LABELS.experience).toBe("Experience");
    expect(CATEGORY_LABELS.skill).toBe("Skills");
    expect(CATEGORY_LABELS.project).toBe("Projects");
    expect(CATEGORY_LABELS.education).toBe("Education");
    expect(CATEGORY_LABELS.achievement).toBe("Achievements");
    expect(CATEGORY_LABELS.certification).toBe("Certifications");
  });
});
