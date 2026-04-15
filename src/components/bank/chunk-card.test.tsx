import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChunkCard, getEntryTitle, getEntryPreview } from "./chunk-card";
import type { BankEntry } from "@/types";

function makeBankEntry(overrides: Partial<BankEntry> = {}): BankEntry {
  return {
    id: "test-1",
    userId: "default",
    category: "experience",
    content: { title: "Engineer", company: "Acme Corp", description: "Built things" },
    confidenceScore: 0.9,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("getEntryTitle", () => {
  it("should return title at company for experience", () => {
    const entry = makeBankEntry({
      category: "experience",
      content: { title: "Engineer", company: "Acme" },
    });
    expect(getEntryTitle(entry)).toBe("Engineer at Acme");
  });

  it("should return degree — institution for education", () => {
    const entry = makeBankEntry({
      category: "education",
      content: { degree: "BS CS", institution: "MIT" },
    });
    expect(getEntryTitle(entry)).toBe("BS CS — MIT");
  });

  it("should return name for skill", () => {
    const entry = makeBankEntry({
      category: "skill",
      content: { name: "TypeScript" },
    });
    expect(getEntryTitle(entry)).toBe("TypeScript");
  });

  it("should return name for project", () => {
    const entry = makeBankEntry({
      category: "project",
      content: { name: "Cool App" },
    });
    expect(getEntryTitle(entry)).toBe("Cool App");
  });

  it("should return name — issuer for certification", () => {
    const entry = makeBankEntry({
      category: "certification",
      content: { name: "AWS Cert", issuer: "Amazon" },
    });
    expect(getEntryTitle(entry)).toBe("AWS Cert — Amazon");
  });

  it("should return description for achievement", () => {
    const entry = makeBankEntry({
      category: "achievement",
      content: { description: "Won hackathon" },
    });
    expect(getEntryTitle(entry)).toBe("Won hackathon");
  });

  it("should fallback gracefully for empty content", () => {
    const entry = makeBankEntry({ category: "skill", content: {} });
    expect(getEntryTitle(entry)).toBe("Skill");
  });
});

describe("getEntryPreview", () => {
  it("should show date range for experience", () => {
    const entry = makeBankEntry({
      category: "experience",
      content: { startDate: "2020", endDate: "2023", description: "Did things" },
    });
    const preview = getEntryPreview(entry);
    expect(preview).toContain("2020");
    expect(preview).toContain("2023");
    expect(preview).toContain("Did things");
  });

  it("should show Present for current experience", () => {
    const entry = makeBankEntry({
      category: "experience",
      content: { startDate: "2020", current: true },
    });
    expect(getEntryPreview(entry)).toContain("Present");
  });

  it("should show category and proficiency for skill", () => {
    const entry = makeBankEntry({
      category: "skill",
      content: { name: "Go", category: "technical", proficiency: "advanced" },
    });
    const preview = getEntryPreview(entry);
    expect(preview).toContain("technical");
    expect(preview).toContain("advanced");
  });

  it("should show description for project", () => {
    const entry = makeBankEntry({
      category: "project",
      content: { name: "App", description: "A cool project" },
    });
    expect(getEntryPreview(entry)).toContain("A cool project");
  });
});

describe("ChunkCard", () => {
  it("should render entry title and category badge", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Engineer at Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
  });

  it("should show high confidence badge when score >= 0.9", () => {
    const entry = makeBankEntry({ confidenceScore: 0.95 });
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("High confidence")).toBeInTheDocument();
  });

  it("should not show high confidence badge when score < 0.9", () => {
    const entry = makeBankEntry({ confidenceScore: 0.7 });
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText("High confidence")).not.toBeInTheDocument();
  });

  it("should expand on click and show content", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    // Click to expand
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));

    // Should show Edit and Delete buttons
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call onDelete when delete is clicked", () => {
    const onDelete = vi.fn();
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={onDelete} />);

    // Expand
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    // Delete
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith("test-1");
  });

  it("should enter edit mode and save changes", () => {
    const onUpdate = vi.fn();
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={onUpdate} onDelete={vi.fn()} />);

    // Expand
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    // Edit
    fireEvent.click(screen.getByText("Edit"));

    // Should show textarea
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();

    // Modify and save
    fireEvent.change(textarea, {
      target: { value: '{"title":"Senior Engineer","company":"Acme Corp"}' },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith("test-1", {
      title: "Senior Engineer",
      company: "Acme Corp",
    });
  });

  it("should cancel edit mode", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    // Expand -> Edit -> Cancel
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Cancel"));

    // Should be back to view mode with Edit button
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
