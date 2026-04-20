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

  it("should render All chip with total count badge", () => {
    render(<SearchBar {...defaultProps} />);
    const allTab = screen.getByRole("tab", { name: /All/i });
    expect(allTab).toBeInTheDocument();
    expect(allTab).toHaveTextContent("12");
  });

  it("should render category chips with count badges", () => {
    render(<SearchBar {...defaultProps} />);
    const expTab = screen.getByRole("tab", { name: /Experience/i });
    expect(expTab).toHaveTextContent("5");

    const skillTab = screen.getByRole("tab", { name: /Skills/i });
    expect(skillTab).toHaveTextContent("3");

    const projTab = screen.getByRole("tab", { name: /Projects/i });
    expect(projTab).toHaveTextContent("2");

    const eduTab = screen.getByRole("tab", { name: /Education/i });
    expect(eduTab).toHaveTextContent("1");

    const achTab = screen.getByRole("tab", { name: /Achievements/i });
    expect(achTab).toHaveTextContent("0");

    const certTab = screen.getByRole("tab", { name: /Certifications/i });
    expect(certTab).toHaveTextContent("1");
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
    fireEvent.click(screen.getByRole("tab", { name: /Experience/i }));
    expect(onCategoryChange).toHaveBeenCalledWith("experience");
  });

  it("should call onCategoryChange with 'all' when clicking All chip", () => {
    const onCategoryChange = vi.fn();
    render(<SearchBar {...defaultProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByRole("tab", { name: /All/i }));
    expect(onCategoryChange).toHaveBeenCalledWith("all");
  });

  it("should show clear button when query is non-empty", () => {
    render(<SearchBar {...defaultProps} query="test" />);
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

  it("should mark active category tab as aria-selected", () => {
    render(<SearchBar {...defaultProps} activeCategory="experience" />);
    const expTab = screen.getByRole("tab", { name: /Experience/i });
    expect(expTab).toHaveAttribute("aria-selected", "true");

    const allTab = screen.getByRole("tab", { name: /All/i });
    expect(allTab).toHaveAttribute("aria-selected", "false");
  });

  it("should render filter chips container with tablist role", () => {
    render(<SearchBar {...defaultProps} />);
    const tablist = screen.getByRole("tablist", { name: "Filter by category" });
    expect(tablist).toBeInTheDocument();
  });

  it("should apply reduced opacity to categories with zero count", () => {
    render(<SearchBar {...defaultProps} />);
    const achTab = screen.getByRole("tab", { name: /Achievements/i });
    expect(achTab.className).toContain("opacity-50");
  });
});
